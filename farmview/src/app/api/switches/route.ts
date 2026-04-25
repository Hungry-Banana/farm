import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// Index / API documentation
export async function GET(request: NextRequest) {
  return proxyToFarmCore(request, 'api/v1/switches');
}

// Create a new switch
export async function POST(request: NextRequest) {
  return proxyToFarmCore(request, 'api/v1/switches');
}
