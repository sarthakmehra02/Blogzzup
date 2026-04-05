/**
 * Netlify Function: devto.js
 * Proxies all /api/devto/* requests to https://dev.to/api/*
 * This runs server-side, bypassing browser CORS restrictions.
 */

export default async (request, context) => {
  const url = new URL(request.url);
  const subPath = url.pathname.replace(/^\/?api\/devto/, '') || '/';
  const targetUrl = `https://dev.to/api${subPath}${url.search}`;

  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  }

  const init = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  // Handle preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'api-key, Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'api-key, Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: ['/api/devto', '/api/devto/*'],
};
