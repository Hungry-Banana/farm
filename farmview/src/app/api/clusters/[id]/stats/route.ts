import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get statistics for a specific cluster
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/clusters/${clusterId}/stats`);
}

export const GET = handler;
