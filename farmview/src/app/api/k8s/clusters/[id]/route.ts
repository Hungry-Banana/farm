import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clusterId } = await params;
  return proxyToFarmCore(request, `api/v1/k8s/clusters/${clusterId}`);
}

export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
