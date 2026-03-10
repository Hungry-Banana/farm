import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../proxy';

// Shared handler that forwards any HTTP method to FarmCore for specific position
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ position_id: string }> }
) {
  const { position_id: positionId } = await params;
  return proxyToFarmCore(request, `api/v1/datacenters/positions/${positionId}`);
}

// Export named functions for each HTTP method (required by Next.js App Router)
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const POST = handler;
export const PATCH = handler;
