import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function getBackendBaseUrl(): string {
  const candidates = [
    process.env.API_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeBaseUrl(candidate);
    if (isAbsoluteHttpUrl(normalized)) {
      return normalized;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return 'http://localhost:3001';
}

function buildTargetUrl(req: NextRequest, path: string[], backend: string): string {
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join('/');
  const target = new URL(`${backend}/${encodedPath}`);
  target.search = req.nextUrl.search;
  return target.toString();
}

async function proxyRequest(req: NextRequest, path: string[]): Promise<NextResponse> {
  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return NextResponse.json(
      {
        message:
          'API proxy is not configured with an absolute backend URL. Set API_URL (or BACKEND_URL) on the frontend server.',
      },
      { status: 500 },
    );
  }

  const targetUrl = buildTargetUrl(req, path, backendBaseUrl);
  const upstreamHeaders = new Headers(req.headers);

  // Ensure fetch computes correct protocol-level headers for the upstream.
  upstreamHeaders.delete('host');
  upstreamHeaders.delete('content-length');

  const method = req.method.toUpperCase();
  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const raw = await req.arrayBuffer();
    body = raw.byteLength > 0 ? raw : undefined;
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method,
      headers: upstreamHeaders,
      body,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        message:
          `Unable to reach backend API from proxy (${reason}). ` +
          'Verify API_URL/BACKEND_URL and backend service availability.',
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstreamResponse.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function HEAD(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

