import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// Get statistics for all clusters
export async function GET(request: NextRequest) {
  return proxyToFarmCore(request, 'api/v1/clusters/stats');
}
