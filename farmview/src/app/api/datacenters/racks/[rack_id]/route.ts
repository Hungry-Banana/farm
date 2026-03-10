import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Shared handler that forwards any HTTP method to FarmCore for specific rack
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ rack_id: string }> }
) {
  const { rack_id: rackId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/racks/${rackId}`);
}

// Export named functions for each HTTP method (required by Next.js App Router)
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const POST = handler;
export const PATCH = handler;
