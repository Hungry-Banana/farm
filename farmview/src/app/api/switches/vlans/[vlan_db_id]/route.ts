import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// DELETE /api/switches/vlans/[vlan_db_id]  — remove a VLAN from a switch
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ vlan_db_id: string }> }
) {
  const { vlan_db_id } = await params;
  return proxyToFarmCore(request, `api/v1/switches/vlans/${vlan_db_id}`);
}

export const DELETE = handler;
