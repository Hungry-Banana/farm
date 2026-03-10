import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get cluster with all its servers
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/clusters/${clusterId}/with-servers`);
}

export const GET = handler;
