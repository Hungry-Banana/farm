import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../../proxy';

// Get rack utilization statistics
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ rack_id: string }> }
) {
  const { rack_id: rackId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/racks/${rackId}/utilization`);
}

export const GET = handler;
