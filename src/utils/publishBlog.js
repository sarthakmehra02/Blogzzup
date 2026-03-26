import axios from 'axios';
import TurndownService from 'turndown';
import showdown from 'showdown';

const turndownService = new TurndownService();
const converter = new showdown.Converter();

const isHtml = (str) => /<[a-z][\s\S]*>/i.test(str);

const ensureHtml = (content) => {
  if (isHtml(content)) return content;
  return converter.makeHtml(content);
};

const ensureMarkdown = (content) => {
  if (!isHtml(content)) return content;
  return turndownService.turndown(content);
};

export async function publishToWordPress({ title, content, tags, credentials }) {
  const { url, username, applicationPassword } = credentials;
  const htmlContent = ensureHtml(content);
  
  // Use Buffer for Node.js or btoa for browser
  const authStr = `${username}:${applicationPassword}`;
  const token = typeof Buffer !== 'undefined' ? Buffer.from(authStr).toString('base64') : btoa(authStr);
  
  const response = await axios.post(
    `${url}/wp-json/wp/v2/posts`,
    {
      title,
      content: htmlContent,
      status: 'publish'
    },
    {
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

export async function publishToBlogger({ title, content, tags, credentials }) {
  const { blogId, accessToken } = credentials;
  const htmlContent = ensureHtml(content);

  const response = await axios.post(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`,
    {
      title,
      content: htmlContent,
      labels: tags
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function publishToDevto({ title, content, tags, credentials }) {
  const { apiKey } = credentials;
  const markdownContent = ensureMarkdown(content);

  const response = await axios.post(
    '/api/devto/articles',
    {
      article: {
        title,
        body_markdown: markdownContent,
        published: true,
        tags: tags ? tags.slice(0, 4) : []
      }
    },
    {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function publishToHashnode({ title, content, tags, credentials }) {
  const { personalAccessToken, publicationId } = credentials;
  const markdownContent = ensureMarkdown(content);

  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          url
        }
      }
    }
  `;

  const tagsList = tags ? tags.map(tag => ({ slug: tag.toLowerCase().replace(/\s+/g, '-'), name: tag })) : [];

  const response = await axios.post(
    '/api/hashnode',
    {
      query,
      variables: {
        input: {
          title,
          contentMarkdown: markdownContent,
          publicationId,
          tags: tagsList
        }
      }
    },
    {
      headers: {
        'Authorization': personalAccessToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data.publishPost.post;
}

export async function publishToTumblr({ title, content, tags, credentials }) {
  // Tumblr requires OAuth 1.0a. For a full Node backend you'd use 'oauth-1.0a' and 'crypto'.
  // We're structuring the Axios call here, assuming a simplified server/bearer token or a proxy 
  // if executed from the browser to avoid exposing OAuth secrets.
  const { blogIdentifier, consumerKey, consumerSecret, oauthToken, oauthTokenSecret } = credentials;
  const htmlContent = ensureHtml(content);

  const response = await axios.post(
    `/api/tumblr/blog/${blogIdentifier}/post`,
    {
      type: 'text',
      title,
      body: htmlContent,
      tags: tags ? tags.join(',') : ''
    },
    {
      headers: {
        'Authorization': `Bearer ${oauthToken}`, // Simplified for proxy to handle full signing
        'X-Consumer-Key': consumerKey,
        'X-Consumer-Secret': consumerSecret,
        'X-Token-Secret': oauthTokenSecret,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function publishBlog(platform, data) {
  try {
    switch(platform) {
      case 'wordpress': return await publishToWordPress(data);
      case 'blogger': return await publishToBlogger(data);
      case 'devto': return await publishToDevto(data);
      case 'hashnode': return await publishToHashnode(data);
      case 'tumblr': return await publishToTumblr(data);
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Error publishing to ${platform}:`, error);
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to publish blog');
  }
}
