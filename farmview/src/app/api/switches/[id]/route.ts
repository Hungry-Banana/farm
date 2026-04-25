import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToFarmCore(request, `api/v1/switches/${id}`);
}

export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const POST = handler;
export const PATCH = handler;
