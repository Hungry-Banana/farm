import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ server_id: string }> }
) {
  const { server_id } = await params;
  return proxyToFarmCore(request, `api/v1/vms/server/${server_id}`);
}
