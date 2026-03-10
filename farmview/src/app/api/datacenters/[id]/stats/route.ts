import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get statistics for a specific datacenter
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datacenterId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/${datacenterId}/stats`);
}

export const GET = handler;
