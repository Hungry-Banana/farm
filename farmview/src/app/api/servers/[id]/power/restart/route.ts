import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '../../../../proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: serverId } = await params;
  return proxyToFarmCore(request, `api/v1/servers/${serverId}/power/restart`);
}
