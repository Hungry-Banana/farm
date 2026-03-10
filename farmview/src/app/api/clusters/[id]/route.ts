import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../proxy';

// Shared handler that forwards any HTTP method to FarmCore for specific cluster
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/clusters/${clusterId}`);
}

// Export named functions for each HTTP method (required by Next.js App Router)
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const POST = handler;
export const PATCH = handler;
