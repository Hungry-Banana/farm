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
      let detailedError = '';
      
      try {
        const errorData = await response.json();
        // Try to extract error message from various response formats
        if (errorData.error) {
          detailedError = errorData.error;
        } else if (errorData.message) {
          detailedError = errorData.message;
        } else if (errorData.data?.message) {
          detailedError = errorData.data.message;
        } else if (errorData.data?.error) {
          detailedError = errorData.data.error;
        }
        
        if (detailedError) {
          errorMessage = detailedError;
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
  const { convertToSequentialFormat, validateSearchCriteria } = await import('@/lib/searchFormat');
  
  const params: Record<string, string | number | (string | number)[]> = {
    page,
    per_page: perPage,
  };

  // Handle search criteria - use sequential format to preserve individual logic operators
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
      // Convert to sequential format (preserves order and individual logic operators)
      const sequentialSearch = convertToSequentialFormat(validCriteria);
      console.log('🏗️  Converted to sequential format:', sequentialSearch);
      
      // Send as JSON-encoded search parameter (backend will parse this as SearchCriterion array)
      params.search = JSON.stringify(sequentialSearch);
      console.log('📤 Sequential search parameter:', params.search);
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
    POWER: {
      ON: (id: number) => `/api/servers/${id}/power/on`,
      OFF: (id: number) => `/api/servers/${id}/power/off`,
      RESTART: (id: number) => `/api/servers/${id}/power/restart`,
      FORCE_OFF: (id: number) => `/api/servers/${id}/power/force-off`,
      FORCE_RESTART: (id: number) => `/api/servers/${id}/power/force-restart`,
      STATUS: (id: number) => `/api/servers/${id}/power/status`,
    },
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
    OVERVIEW: '/api/k8s/overview',
    
    // Cluster management
    CLUSTERS: '/api/k8s/clusters',
    CLUSTER_BY_ID: (id: number) => `/api/k8s/clusters/${id}`,
    CLUSTER_WORKLOADS: (id: number) => `/api/k8s/clusters/${id}/workloads`,
    CLUSTER_NAMESPACES: (id: number) => `/api/k8s/clusters/${id}/namespaces`,
    CLUSTER_PODS: (id: number) => `/api/k8s/clusters/${id}/pods`,
    CLUSTER_SERVICES: (id: number) => `/api/k8s/clusters/${id}/services`,
    CLUSTER_EVENTS: (id: number) => `/api/k8s/clusters/${id}/events`,
    
    // Node management
    NODES: '/api/k8s/nodes',
    NODE_BY_ID: (id: number) => `/api/k8s/nodes/${id}`,
    
    // Namespace management
    NAMESPACES: '/api/k8s/namespaces',
    NAMESPACE_BY_ID: (id: number) => `/api/k8s/namespaces/${id}`,
    
    // Resource management
    WORKLOADS: '/api/k8s/workloads',
    PODS: '/api/k8s/pods',
    SERVICES: '/api/k8s/services',
    EVENTS: '/api/k8s/events',
    
    // Inventory
    INVENTORY: '/api/k8s/inventory',
    
    // CRUD operations
    CREATE_CLUSTER: '/api/k8s/clusters',
    UPDATE_CLUSTER: (id: number) => `/api/k8s/clusters/${id}`,
    DELETE_CLUSTER: (id: number) => `/api/k8s/clusters/${id}`,
    UPDATE_NODE: (id: number) => `/api/k8s/nodes/${id}`,
    DELETE_NODE: (id: number) => `/api/k8s/nodes/${id}`,
  },

  // Datacenter endpoints
  DATACENTERS: {
    // Core datacenter operations
    LIST: '/api/datacenters/list',
    BY_ID: (id: number) => `/api/datacenters/${id}`,
    WITH_RACKS: (id: number) => `/api/datacenters/${id}/with-racks`,
    STATS: '/api/datacenters/stats',
    DATACENTER_STATS: (id: number) => `/api/datacenters/${id}/stats`,
    CREATE: '/api/datacenters',
    UPDATE: (id: number) => `/api/datacenters/${id}`,
    DELETE: (id: number) => `/api/datacenters/${id}`,
    
    // Rack management
    RACKS: {
      BY_DATACENTER: (datacenterId: number) => `/api/datacenters/${datacenterId}/racks`,
      BY_ID: (rackId: number) => `/api/datacenters/racks/${rackId}`,
      WITH_POSITIONS: (rackId: number) => `/api/datacenters/racks/${rackId}/with-positions`,
      UTILIZATION: (rackId: number) => `/api/datacenters/racks/${rackId}/utilization`,
      CREATE: (datacenterId: number) => `/api/datacenters/${datacenterId}/racks`,
      UPDATE: (rackId: number) => `/api/datacenters/racks/${rackId}`,
      DELETE: (rackId: number) => `/api/datacenters/racks/${rackId}`,
      
      // Position management within racks
      POSITIONS: {
        BY_RACK: (rackId: number) => `/api/datacenters/racks/${rackId}/positions`,
        BY_ID: (positionId: number) => `/api/datacenters/positions/${positionId}`,
        CREATE: (rackId: number) => `/api/datacenters/racks/${rackId}/positions`,
        UPDATE: (positionId: number) => `/api/datacenters/positions/${positionId}`,
        DELETE: (positionId: number) => `/api/datacenters/positions/${positionId}`,
      }
    }
  },

  // Cluster endpoints
  CLUSTERS: {
    // Core cluster operations
    LIST: '/api/clusters/list',
    BY_ID: (id: number) => `/api/clusters/${id}`,
    WITH_SUB_CLUSTERS: (id: number) => `/api/clusters/${id}/with-sub-clusters`,
    WITH_SERVERS: (id: number) => `/api/clusters/${id}/with-servers`,
    STATS: '/api/clusters/stats',
    CLUSTER_STATS: (id: number) => `/api/clusters/${id}/stats`,
    CREATE: '/api/clusters',
    UPDATE: (id: number) => `/api/clusters/${id}`,
    DELETE: (id: number) => `/api/clusters/${id}`,
    
    // Sub-cluster management
    SUB_CLUSTERS: {
      BY_CLUSTER: (clusterId: number) => `/api/clusters/${clusterId}/sub-clusters`,
      BY_ID: (subClusterId: number) => `/api/clusters/sub-clusters/${subClusterId}`,
      STATS: (subClusterId: number) => `/api/clusters/sub-clusters/${subClusterId}/stats`,
      CREATE: (clusterId: number) => `/api/clusters/${clusterId}/sub-clusters`,
      UPDATE: (subClusterId: number) => `/api/clusters/sub-clusters/${subClusterId}`,
      DELETE: (subClusterId: number) => `/api/clusters/sub-clusters/${subClusterId}`,
    }
  },

  // Switch endpoints
  SWITCHES: {
    LIST: '/api/switches/get_switches',
    STATS: '/api/switches/stats',
    BY_ID: (id: number) => `/api/switches/${id}`,
    SWITCH_STATS: (id: number) => `/api/switches/${id}/stats`,
    CREATE: '/api/switches',
    UPDATE: (id: number) => `/api/switches/${id}`,
    DELETE: (id: number) => `/api/switches/${id}`,

    // Port management
    PORTS: {
      BY_SWITCH: (switchId: number) => `/api/switches/${switchId}/ports`,
      BY_ID: (portId: number) => `/api/switches/ports/${portId}`,
      CREATE: (switchId: number) => `/api/switches/${switchId}/ports`,
      UPDATE: (portId: number) => `/api/switches/ports/${portId}`,
      DELETE: (portId: number) => `/api/switches/ports/${portId}`,
    },

    // VLAN management
    VLANS: {
      BY_SWITCH: (switchId: number) => `/api/switches/${switchId}/vlans`,
      CREATE: (switchId: number) => `/api/switches/${switchId}/vlans`,
      DELETE: (vlanDbId: number) => `/api/switches/vlans/${vlanDbId}`,
    },
  },
} as const;