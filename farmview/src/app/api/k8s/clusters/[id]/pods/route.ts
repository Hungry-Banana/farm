import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/k8s/clusters/${clusterId}/pods`);
}
