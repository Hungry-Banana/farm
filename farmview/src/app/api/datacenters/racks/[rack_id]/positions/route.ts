import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../../proxy';

// Get all positions for a rack or create a new position
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ rack_id: string }> }
) {
  const { rack_id: rackId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/racks/${rackId}/positions`);
}

export const GET = handler;
export const POST = handler;
