/**
 * blogPublisher.js
 *
 * Multi-platform blog publishing library — BROWSER SAFE.
 * Uses the Web Crypto API (built into all modern browsers) instead of
 * Node's crypto module. No server required.
 *
 * Supports: WordPress, Blogger, Dev.to, Hashnode, Tumblr
 */

import TurndownService from 'turndown';
import showdown from 'showdown';

const turndownService = new TurndownService();
const showdownConverter = new showdown.Converter();

// ─────────────────────────────────────────────
// Format Utilities
// ─────────────────────────────────────────────

const isHtml = (str) => {
  if (typeof str !== 'string') return false;
  return /<([a-z][a-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/i.test(str) ||
         /<([a-z][a-z0-9]*)\b[^>]*\/>/i.test(str);
};

const ensureHtml = (content) => {
  if (!content || typeof content !== 'string') return '';
  return isHtml(content) ? content : showdownConverter.makeHtml(content);
};

const ensureMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  return isHtml(content) ? turndownService.turndown(content) : content;
};

// ─────────────────────────────────────────────
// Validation Utility
// ─────────────────────────────────────────────

function validateCredentials(platform, credentials, requiredKeys) {
  if (!credentials || typeof credentials !== 'object') {
    throw new Error(`[${platform}] credentials must be a non-null object.`);
  }
  const missing = requiredKeys.filter(key => !credentials[key]);
  if (missing.length > 0) {
    throw new Error(`[${platform}] Missing required credentials: ${missing.join(', ')}`);
  }
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return [];
}

// ─────────────────────────────────────────────
// Web Crypto Utilities (replaces Node's crypto)
// ─────────────────────────────────────────────

/**
 * Generates a random hex nonce using the browser's Web Crypto API.
 * Replaces: crypto.randomBytes(16).toString('hex')
 */
function generateNonce() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Signs a string using HMAC-SHA1 via the Web Crypto API.
 * Replaces: crypto.createHmac('sha1', key).update(data).digest('base64')
 */
async function hmacSha1Base64(signingKey, data) {
  const encoder = new TextEncoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    encoder.encode(data)
  );

  // Convert ArrayBuffer to Base64
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// ─────────────────────────────────────────────
// WordPress
// ─────────────────────────────────────────────

async function resolveWordPressTags(siteUrl, tagNames, authHeaders) {
  const tagIds = await Promise.all(
    tagNames.map(async (name) => {
      try {
        const search = await fetch(
          `${siteUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(name)}`,
          { headers: authHeaders }
        );
        const results = await search.json();
        const existing = results.find(
          t => t.name.toLowerCase() === name.toLowerCase()
        );
        if (existing) return existing.id;

        const created = await fetch(`${siteUrl}/wp-json/wp/v2/tags`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ name })
        });
        const createdData = await created.json();
        return createdData.id;
      } catch {
        console.warn(`[WordPress] Could not resolve tag "${name}", skipping.`);
        return null;
      }
    })
  );
  return tagIds.filter(Boolean);
}

export async function publishToWordPress({ title, content, tags, credentials }) {
  validateCredentials('WordPress', credentials, ['url', 'username', 'applicationPassword']);

  const { url, username, applicationPassword } = credentials;
  const htmlContent = ensureHtml(content);
  const normalizedTags = normalizeTags(tags);

  const authToken = btoa(`${username}:${applicationPassword}`);
  const authHeaders = {
    'Authorization': `Basic ${authToken}`,
    'Content-Type': 'application/json'
  };

  let tagIds = [];
  if (normalizedTags.length > 0) {
    tagIds = await resolveWordPressTags(url, normalizedTags, authHeaders);
  }

  const response = await fetch(`${url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title,
      content: htmlContent,
      status: 'publish',
      tags: tagIds
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'WordPress publish failed');
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Blogger
// ─────────────────────────────────────────────

export async function publishToBlogger({ title, content, tags, credentials }) {
  validateCredentials('Blogger', credentials, ['blogId', 'accessToken']);

  const { blogId, accessToken } = credentials;
  const htmlContent = ensureHtml(content);
  const normalizedTags = normalizeTags(tags);

  const response = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        content: htmlContent,
        labels: normalizedTags
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Blogger publish failed');
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Dev.to
// ─────────────────────────────────────────────

export async function publishToDevto({ title, content, tags, credentials }) {
  validateCredentials('Dev.to', credentials, ['apiKey']);

  const { apiKey } = credentials;
  const markdownContent = ensureMarkdown(content);
  const normalizedTags = normalizeTags(tags).slice(0, 4);

  const response = await fetch('/api/devto/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: markdownContent,
        published: true,
        tags: normalizedTags
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Dev.to publish failed');
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Hashnode
// ─────────────────────────────────────────────

export async function publishToHashnode({ title, content, tags, credentials }) {
  validateCredentials('Hashnode', credentials, ['personalAccessToken', 'publicationId']);

  const { personalAccessToken, publicationId } = credentials;
  const markdownContent = ensureMarkdown(content);
  const normalizedTags = normalizeTags(tags);

  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post { id url }
      }
    }
  `;

  const tagsList = normalizedTags.map(tag => ({
    slug: tag.toLowerCase().replace(/\s+/g, '-'),
    name: tag
  }));

  const response = await fetch('/api/hashnode', {
    method: 'POST',
    headers: {
      'Authorization': personalAccessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          title,
          contentMarkdown: markdownContent,
          publicationId,
          tags: tagsList
        }
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.errors?.[0]?.message || 'Hashnode publish failed');
  }

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.publishPost.post;
}

// ─────────────────────────────────────────────
// Tumblr — OAuth 1.0a (Browser-safe)
// ─────────────────────────────────────────────

async function generateOAuthHeader(method, url, bodyParams, credentials) {
  const { consumerKey, consumerSecret, oauthToken, oauthTokenSecret } = credentials;

  const oauthParams = {
    oauth_consumer_key:     consumerKey,
    oauth_nonce:            generateNonce(),        // ✅ Web Crypto nonce
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            oauthToken,
    oauth_version:          '1.0'
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

  // ✅ Web Crypto HMAC-SHA1 — replaces Node's crypto.createHmac
  const signature = await hmacSha1Base64(signingKey, signatureBase);

  const headerParams = { ...oauthParams, oauth_signature: signature };

  return 'OAuth ' + Object.keys(headerParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(headerParams[key])}"`)
    .join(', ');
}

export async function publishToTumblr({ title, content, tags, credentials }) {
  validateCredentials('Tumblr', credentials, [
    'blogIdentifier', 'consumerKey', 'consumerSecret', 'oauthToken', 'oauthTokenSecret'
  ]);

  const htmlContent = ensureHtml(content);
  const normalizedTags = normalizeTags(tags);

  const response = await fetch('/.netlify/functions/tumblr-publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      content:     htmlContent,
      tags:        normalizedTags,
      credentials
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Tumblr publish failed');
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Unified Entry Point
// ─────────────────────────────────────────────

const SUPPORTED_PLATFORMS = ['wordpress', 'blogger', 'devto', 'hashnode', 'tumblr'];

export async function publishBlog(platform, data) {
  if (typeof platform !== 'string' || !platform.trim()) {
    throw new Error('platform must be a non-empty string.');
  }

  const normalizedPlatform = platform.toLowerCase().trim();

  if (!SUPPORTED_PLATFORMS.includes(normalizedPlatform)) {
    throw new Error(
      `Unsupported platform: "${platform}". ` +
      `Supported: ${SUPPORTED_PLATFORMS.join(', ')}.`
    );
  }

  if (!data?.title || typeof data.title !== 'string') {
    throw new Error('data.title must be a non-empty string.');
  }

  if (!data?.content || typeof data.content !== 'string') {
    throw new Error('data.content must be a non-empty string.');
  }

  try {
    switch (normalizedPlatform) {
      case 'wordpress': return await publishToWordPress(data);
      case 'blogger':   return await publishToBlogger(data);
      case 'devto':     return await publishToDevto(data);
      case 'hashnode':  return await publishToHashnode(data);
      case 'tumblr':    return await publishToTumblr(data);
    }
  } catch (error) {
    if (error.message.startsWith('[')) throw error;
    throw new Error(`[${platform}] Publishing failed: ${error.message}`);
  }
}