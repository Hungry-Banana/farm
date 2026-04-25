import { NextRequest } from 'next/server';
import { proxyToFarmCore } from '@/app/api/proxy';

const handler = (request: NextRequest) =>
  proxyToFarmCore(request, 'api/v1/switches/get_switches');

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
