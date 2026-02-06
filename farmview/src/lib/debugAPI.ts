/**
 * Enhanced API utilities with debug logging support
 */

import { useDebug } from '@/contexts/DebugContext';

export class DebugAPI {
  private baseURL: string;
  private logResponses: boolean;
  
  constructor(baseURL: string = '', logResponses: boolean = false) {
    this.baseURL = baseURL;
    this.logResponses = logResponses;
  }

  async get(url: string, options?: RequestInit) {
    return this.request('GET', url, options);
  }

  async post(url: string, data?: any, options?: RequestInit) {
    return this.request('POST', url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async request(method: string, url: string, options?: RequestInit) {
    const fullURL = this.baseURL + url;
    const startTime = performance.now();

    if (this.logResponses) {
      console.group(`🌐 ${method} ${fullURL}`);
      console.log('Request Options:', options);
    }

    try {
      const response = await fetch(fullURL, { method, ...options });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (this.logResponses) {
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.error('❌ Response not OK');
        }
      }

      const data = await response.json();

      if (this.logResponses) {
        console.log('📦 Response Data:', data);
        console.groupEnd();
      }

      return { response, data, duration };
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (this.logResponses) {
        console.error('💥 Request Failed:', error);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.groupEnd();
      }
      
      throw error;
    }
  }
}

// Hook to get a debug-aware API client
export function useDebugAPI() {
  const { settings } = useDebug();
  
  return new DebugAPI(
    'http://localhost:6183',
    settings.showAPIResponses
  );
}

// Hook for performance timing
export function usePerformanceTimer() {
  const { settings } = useDebug();
  
  return {
    start: (label: string) => {
      if (settings.showPerformanceMetrics) {
        console.time(label);
      }
    },
    end: (label: string) => {
      if (settings.showPerformanceMetrics) {
        console.timeEnd(label);
      }
    },
    mark: (label: string, data?: any) => {
      if (settings.showPerformanceMetrics) {
        console.log(`⏱️ ${label}`, data || '');
      }
    }
  };
}