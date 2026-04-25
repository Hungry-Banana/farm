import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// GET    /api/switches/ports/[port_id]  — get a specific port by ID
// PUT    /api/switches/ports/[port_id]  — update a port
// DELETE /api/switches/ports/[port_id]  — delete a port
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ port_id: string }> }
) {
  const { port_id } = await params;
  return proxyToFarmCore(request, `api/v1/switches/ports/${port_id}`);
}

export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
