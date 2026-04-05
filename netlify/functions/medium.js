/**
 * Netlify Function: medium.js
 * Proxies all /api/medium/* requests to https://api.medium.com/v1/*
 * This runs server-side, bypassing browser CORS restrictions.
 */

export default async (request, context) => {
  // Strip the /api/medium prefix to get the sub-path
  const url = new URL(request.url);
  const subPath = url.pathname.replace(/^\/?api\/medium/, '') || '/';
  const targetUrl = `https://api.medium.com/v1${subPath}${url.search}`;

  // Forward all headers from the original request
  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    // Skip host header — it must be the target's host
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  }

  const init = {
    method: request.method,
    headers,
  };

  // Forward body for POST/PUT requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
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
  path: ['/api/medium', '/api/medium/*'],
};
