import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/app/api/api.configs';

export async function GET() {
  const backendUrl = API_CONFIG.FARMCORE.URL;

  if (!backendUrl) {
    return NextResponse.json(
      { status: 'unconfigured', error: 'FARM_CORE_API_URL environment variable is not set' },
      { status: 503 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const start = Date.now();
    const response = await fetch(`${backendUrl}/api/v1/health`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    // Guard: read the body as text first so a non-JSON response doesn't throw
    const rawText = await response.text();
    let data: Record<string, any>;
    try {
      const json = JSON.parse(rawText);
      // Farm Core wraps responses in { success, data } — unwrap the inner data
      data = json?.data ?? json;
    } catch {
      // Backend is reachable but not returning JSON — likely a misconfigured endpoint
      return NextResponse.json(
        {
          status: 'unreachable',
          error: `Backend returned non-JSON response (HTTP ${response.status}): ${rawText.slice(0, 200)}`,
          backend_url: backendUrl,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { ...data, latency_ms: latency, backend_url: backendUrl },
      { status: response.status }
    );
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        status: 'unreachable',
        error: isTimeout ? 'Connection timed out after 5s' : (error instanceof Error ? error.message : 'Connection failed'),
        backend_url: backendUrl,
      },
      { status: 503 }
    );
  }
}
