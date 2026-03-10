import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Get all racks for a datacenter or create a new rack
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datacenterId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/${datacenterId}/racks`);
}

export const GET = handler;
export const POST = handler;
