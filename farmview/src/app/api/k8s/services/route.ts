import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToFarmCore(request, 'api/v1/k8s/services');
}
