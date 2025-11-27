/**
 * Tempo OAuth Proxy - Cloudflare Worker
 * 
 * This worker securely handles the OAuth token exchange with Atlassian.
 * The client_secret is stored as a Cloudflare secret and never exposed to the browser.
 */

const ALLOWED_ORIGINS = [
  'moz-extension://',  // Firefox extensions
  'chrome-extension://', // Chrome extensions (future)
  'https://claudio-ferraro.github.io' // GitHub Pages callback
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders(origin) }
      );
    }

    try {
      const body = await request.json();
      const { grant_type, code, refresh_token, redirect_uri, code_verifier } = body;

      // Validate required fields
      if (!grant_type) {
        return new Response(
          JSON.stringify({ error: 'grant_type is required' }),
          { status: 400, headers: corsHeaders(origin) }
        );
      }

      // Build the token request
      const tokenBody = {
        grant_type,
        client_id: env.ATLASSIAN_CLIENT_ID,
        client_secret: env.ATLASSIAN_CLIENT_SECRET, // Secret from Cloudflare
        redirect_uri
      };

      // Add grant-specific fields
      if (grant_type === 'authorization_code') {
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'code is required for authorization_code grant' }),
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        tokenBody.code = code;
        if (code_verifier) {
          tokenBody.code_verifier = code_verifier;
        }
      } else if (grant_type === 'refresh_token') {
        if (!refresh_token) {
          return new Response(
            JSON.stringify({ error: 'refresh_token is required for refresh_token grant' }),
            { status: 400, headers: corsHeaders(origin) }
          );
        }
        tokenBody.refresh_token = refresh_token;
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid grant_type' }),
          { status: 400, headers: corsHeaders(origin) }
        );
      }

      // Make request to Atlassian
      const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenBody)
      });

      const tokenData = await tokenResponse.json();

      // Return the response (success or error)
      return new Response(
        JSON.stringify(tokenData),
        { 
          status: tokenResponse.status, 
          headers: corsHeaders(origin) 
        }
      );

    } catch (error) {
      console.error('Token exchange error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        { status: 500, headers: corsHeaders(origin) }
      );
    }
  }
};
