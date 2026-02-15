import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vm_id: string }> }
) {
  const { vm_id } = await params;
  return proxyToFarmCore(request, `api/v1/vms/${vm_id}`);
}
