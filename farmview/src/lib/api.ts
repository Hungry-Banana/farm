import { API_CONFIG} from '@/lib/config';

interface ApiOptions {
  timeout?: number;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | (string | number)[]>;
}

export async function apiRequest(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<any> {
  const {
    timeout = API_CONFIG.TIMEOUTS.DEFAULT,
    method = 'GET',
    body,
    headers = {},
    params = {},
  } = options;

  let url = endpoint.startsWith('http') ? endpoint : endpoint;

  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values by appending each value with the same key
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch (e) {
        // If we can't parse the error response, use the original message
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Convenience methods for common HTTP verbs
export const api = {
  get: (endpoint: string, params?: Record<string, string | number | (string | number)[]>, headers?: Record<string, string>) =>
    apiRequest(endpoint, { method: 'GET', params, headers }),
    
  post: (endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiRequest(endpoint, { method: 'POST', body, headers }),
    
  put: (endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiRequest(endpoint, { method: 'PUT', body, headers }),
    
  delete: (endpoint: string, headers?: Record<string, string>) =>
    apiRequest(endpoint, { method: 'DELETE', headers }),
    
  patch: (endpoint: string, body?: any, headers?: Record<string, string>) =>
    apiRequest(endpoint, { method: 'PATCH', body, headers })
};

// Error handling wrapper
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error);
    }
    return fallback;
  }
}

// Generic get by ID helper
export async function getEntityById(endpoint: (id: number) => string, id: number, entityName = "entity") {
  if (isNaN(id)) {
    return null;
  }

  return safeApiCall(
    async () => {
      const result = await apiRequest(endpoint(id));
      return result?.data || null;
    },
    null, // fallback value
    `Error fetching ${entityName} ${id}:`
  );
}

export async function paginatedApiCall(
  endpoint: string,
  page = 1,
  perPage = 15,
  filters: Record<string, any> = {},
  searchCriteria: any[] = [],
  entityName = "items"
) {
  const { convertToStructuredFormat, validateSearchCriteria } = await import('@/lib/searchFormat');
  
  const params: Record<string, string | number | (string | number)[]> = {
    page,
    per_page: perPage,
  };

  // Handle search criteria with new structured format
  if (searchCriteria.length > 0) {
    console.log('🔍 Original search criteria:', searchCriteria);
    
    // Validate search criteria
    const validationErrors = validateSearchCriteria(searchCriteria);
    if (validationErrors.length > 0) {
      console.warn('⚠️  Search validation errors:', validationErrors);
    }
    
    // Filter valid criteria
    const validCriteria = searchCriteria.filter((criteria: any) => 
      criteria.term && 
      criteria.column && 
      criteria.column !== "Search by Column" &&
      criteria.term.trim() !== ''
    );
    
    if (validCriteria.length > 0) {
      // Convert to new structured format
      const structuredSearch = convertToStructuredFormat(validCriteria);
      console.log('🏗️  Converted to structured format:', structuredSearch);
      
      // Send as JSON-encoded search parameter  
      params.search = JSON.stringify(structuredSearch);
      console.log('📤 Structured search parameter:', params.search);
    }
  }

  // Add filters (for any additional simple filters)
  Object.entries(filters).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      params[key] = values.join(',');
    } else if (values && !Array.isArray(values)) {
      params[key] = values.toString();
    }
  });

  console.log('📤 Final API params:', params);

  return safeApiCall(
    async () => {
      const result = await apiRequest(endpoint, { params });
      return result; // Return full response with meta for pagination
    },
    {
      success: false,
      data: [],
      meta: {
        pagination: {
          current_page: 1,
          per_page: perPage,
          total_count: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        }
      }
    },
    `Failed to fetch paginated ${entityName}:`
  );
}

// API Endpoints
export const API_ENDPOINTS = {
  // Server endpoints
  SERVERS: {
    LIST: '/api/servers/get_servers',
    BY_ID: (id: number) => `/api/servers/${id}`,
    OVERVIEW: '/api/servers/overview',
    CREATE: '/api/servers',
    UPDATE: (id: number) => `/api/servers/${id}`,
    DELETE: (id: number) => `/api/servers/${id}`,
  },
  
  // Component endpoints
  COMPONENTS: {
    CATALOG: '/api/servers/components/catalog',
    STATS: '/api/servers/components/stats',
    CPUS: '/api/servers/components/cpus',
    MEMORY: '/api/servers/components/memory',
    DISKS: '/api/servers/components/disks',
    NETWORK: '/api/servers/components/network',
    GPUS: '/api/servers/components/gpus',
    MOTHERBOARDS: '/api/components/motherboards',
  },

  MIGRATIONS: {
    RUN: '/api/migrations/run',
    RESET: '/api/migrations/reset',
  },

  // Virtual Machine endpoints
  VMS: {
    LIST: '/api/vms/get_vms',
    BY_ID: (id: number) => `/api/vms/${id}`,
    OVERVIEW: '/api/vms/overview',
    RUNNING: '/api/vms/running',
    BY_SERVER: (serverId: number) => `/api/vms/server/${serverId}`,
    BACKUP_NEEDED: '/api/vms/backup-needed',
    MIGRATIONS: (id: number) => `/api/vms/${id}/migrations`,
    RESOURCE_USAGE: (id: number) => `/api/vms/${id}/resource-usage`,
    CONFIG_HISTORY: (id: number) => `/api/vms/${id}/config-history`,
    CREATE: '/api/vms',
    UPDATE: (id: number) => `/api/vms/${id}`,
    DELETE: (id: number) => `/api/vms/${id}`,
  },

  // Kubernetes endpoints
  KUBERNETES: {
    // Overview and statistics
    OVERVIEW: '/api/kubernetes/overview',
    STATS: '/api/kubernetes/stats',
    
    // Cluster management
    CLUSTERS: '/api/kubernetes/clusters',
    CLUSTER_BY_ID: (id: number) => `/api/kubernetes/clusters/${id}`,
    CLUSTER_DETAILS: (id: number) => `/api/kubernetes/clusters/${id}/details`,
    CLUSTER_NODES: (id: number) => `/api/kubernetes/clusters/${id}/nodes`,
  }
} as const;