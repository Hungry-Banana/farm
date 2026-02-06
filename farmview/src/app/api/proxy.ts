import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config/api.server';

/**
 * Farm Core API Proxy
 * 
 * Usage:
 * - Standard API call: proxyToFarmCore(request, 'api/v1/servers/get_servers')
 * - V2 API call: proxyToFarmCore(request, 'api/v2/auth/login')
 * - Custom endpoint: proxyToFarmCore(request, 'legacy/servers')
 */

interface ProxyOptions {
  method?: string;
  timeout?: number;
  customHeaders?: Record<string, string>;
}

export async function proxyToFarmCore(
  request: NextRequest, 
  endpoint: string,
  options: ProxyOptions = {}
) {
  const {
    method = request.method, // Default to the incoming request method
    timeout = API_CONFIG.TIMEOUTS.DEFAULT,
    customHeaders = {}
  } = options;

  try {
    const { searchParams } = new URL(request.url);
    
    // Get backend configuration
    const FARM_CORE_URL = API_CONFIG.FARMCORE.URL;
    
    // Build target URL
    let targetUrl = `${FARM_CORE_URL}/${endpoint}`;
    
    // Add query parameters
    if (searchParams.toString()) {
      targetUrl += `?${searchParams.toString()}`;
    }

    console.log(`🔄 [${method}] Farm Core Proxy: ${endpoint} -> ${targetUrl}`);

    // Prepare request body for non-GET methods
    let body = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const requestText = await request.text();
        if (requestText) {
          body = requestText;
        }
      } catch (e) {
        console.warn('Could not read request body:', e);
      }
    }

    // Make the proxied request
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Farm-Dashboard/1.0',
        // Forward important headers
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('content-type') && {
          'Content-Type': request.headers.get('content-type')!
        }),
        // Add any custom headers
        ...customHeaders
      },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
      console.error(`❌ Farm Core API error [${method}] ${endpoint}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `API error: ${response.status}`,
          message: response.statusText,
          endpoint: endpoint
        },
        { status: response.status }
      );
    }

    // Handle different response types
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📦 [${method}] ${endpoint}: ${JSON.stringify(data).length} bytes`);
      return NextResponse.json(data);
    } else {
      // Handle non-JSON responses
      const data = await response.text();
      console.log(`📄 [${method}] ${endpoint}: ${data.length} bytes (${contentType})`);
      return new NextResponse(data, {
        status: response.status,
        headers: { 'Content-Type': contentType },
      });
    }

  } catch (error) {
    console.error(`💥 [${method}] Farm Core proxy error (${endpoint}):`, error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout',
          message: 'Request took too long to complete',
          endpoint: endpoint
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        endpoint: endpoint
      },
      { status: 500 }
    );
  }
}

// Universal HTTP method handlers that can be exported from route files
export async function GET(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'GET' });
}

export async function POST(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'POST' });
}

export async function PUT(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'PUT' });
}

export async function PATCH(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'PATCH' });
}

export async function DELETE(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'DELETE' });
}

export async function HEAD(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'HEAD' });
}

export async function OPTIONS(request: NextRequest, endpoint: string, options?: ProxyOptions) {
  return proxyToFarmCore(request, endpoint, { ...options, method: 'OPTIONS' });
}