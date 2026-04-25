import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// GET  /api/switches/[id]/ports  — list all ports for a switch
// POST /api/switches/[id]/ports  — add a port to a switch
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToFarmCore(request, `api/v1/switches/${id}/ports`);
}

export const GET = handler;
export const POST = handler;
