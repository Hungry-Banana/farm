import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

// Shared handler that forwards any HTTP method to FarmCore
const handler = (request: NextRequest) => {
  return proxyToFarmCore(request, 'api/v1/migrations/run');
};

// Export named functions for each HTTP method (required by Next.js App Router)
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;