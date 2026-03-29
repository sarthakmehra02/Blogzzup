/**
 * netlify/functions/tumblr-publish.js
 *
 * Netlify serverless function — runs on the server, never in the browser.
 * Handles Tumblr OAuth 1.0a signing safely using Node's crypto module.
 *
 * Endpoint (auto-assigned by Netlify):
 *   POST /.netlify/functions/tumblr-publish
 */

import crypto from 'crypto';

// ─────────────────────────────────────────────
// OAuth 1.0a Helpers
// ─────────────────────────────────────────────

function generateNonce() {
    return crypto.randomBytes(16).toString('hex');
}

function generateOAuthHeader(method, url, bodyParams, credentials) {
    const { consumerKey, consumerSecret, oauthToken, oauthTokenSecret } = credentials;

    const oauthParams = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: oauthToken,
        oauth_version: '1.0'
    };

    const allParams = { ...oauthParams, ...bodyParams };
    const paramString = Object.keys(allParams)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
        .join('&');

    const signatureBase = [
        method.toUpperCase(),
        encodeURIComponent(url),
        encodeURIComponent(paramString)
    ].join('&');

    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(oauthTokenSecret)}`;

    const signature = crypto
        .createHmac('sha1', signingKey)
        .update(signatureBase)
        .digest('base64');

    const headerParams = { ...oauthParams, oauth_signature: signature };

    return 'OAuth ' + Object.keys(headerParams)
        .sort()
        .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(headerParams[key])}"`)
        .join(', ');
}

// ─────────────────────────────────────────────
// Netlify Function Handler
// ─────────────────────────────────────────────

export const handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON body' })
        };
    }

    const { title, content, tags, credentials } = body;

    // Validate required fields
    const requiredCreds = ['blogIdentifier', 'consumerKey', 'consumerSecret', 'oauthToken', 'oauthTokenSecret'];
    const missing = requiredCreds.filter(k => !credentials?.[k]);
    if (missing.length > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Missing credentials: ${missing.join(', ')}` })
        };
    }

    const {
        blogIdentifier,
        consumerKey,
        consumerSecret,
        oauthToken,
        oauthTokenSecret
    } = credentials;

    const url = `https://api.tumblr.com/v2/blog/${blogIdentifier}/post`;

    const bodyParams = {
        type: 'text',
        title,
        body: content,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || '')
    };

    const authHeader = generateOAuthHeader('POST', url, bodyParams, {
        consumerKey,
        consumerSecret,
        oauthToken,
        oauthTokenSecret
    });

    const formBody = new URLSearchParams(bodyParams).toString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data?.meta?.msg || 'Tumblr API error', detail: data })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};