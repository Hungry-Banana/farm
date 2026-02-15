import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// Method 1: Use the main proxy function (automatically detects method)
export async function GET(request: NextRequest) {
  return proxyToFarmCore(request, 'api/v1/vms/overview');
}