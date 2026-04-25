import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// Get sub-cluster statistics
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ sub_cluster_id: string }> }
) {
  const { sub_cluster_id: subClusterId } = await params;
  return proxyToFarmCore(request, `api/v1/clusters/sub-clusters/${subClusterId}/stats`);
}

export const GET = handler;
