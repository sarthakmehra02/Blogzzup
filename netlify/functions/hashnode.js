/**
 * Netlify Function: hashnode.js
 * Proxies all /api/hashnode requests to https://gql.hashnode.com
 * This runs server-side, bypassing browser CORS restrictions.
 */

export default async (request, context) => {
  const targetUrl = 'https://gql.hashnode.com';

  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  }

  // Handle preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const init = {
    method: request.method,
    headers,
  };

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ errors: [{ message: err.message }] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: ['/api/hashnode', '/api/hashnode/*'],
};
