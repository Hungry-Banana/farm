import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get all sub-clusters for a cluster or create a new sub-cluster
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/clusters/${clusterId}/sub-clusters`);
}

export const GET = handler;
export const POST = handler;
