import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../proxy';

// Shared handler that forwards any HTTP method to FarmCore for specific server
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: serverId } = await params;
  return proxyToFarmCore(request, `api/v1/servers/${serverId}`);
}

// Export named functions for each HTTP method (required by Next.js App Router)
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const POST = handler;
export const PATCH = handler;