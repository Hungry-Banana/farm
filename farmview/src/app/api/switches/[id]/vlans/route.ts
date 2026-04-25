import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// GET  /api/switches/[id]/vlans  — list all VLANs for a switch
// POST /api/switches/[id]/vlans  — add a VLAN to a switch
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToFarmCore(request, `api/v1/switches/${id}/vlans`);
}

export const GET = handler;
export const POST = handler;
