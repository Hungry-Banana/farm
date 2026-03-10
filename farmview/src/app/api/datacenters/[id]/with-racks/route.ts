import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get datacenter with all its racks
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datacenterId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/${datacenterId}/with-racks`);
}

export const GET = handler;
