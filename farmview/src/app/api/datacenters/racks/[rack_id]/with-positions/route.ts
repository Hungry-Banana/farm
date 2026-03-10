import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../../proxy';

// Get rack with all its positions
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ rack_id: string }> }
) {
  const { rack_id: rackId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/racks/${rackId}/with-positions`);
}

export const GET = handler;
