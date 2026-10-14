// Cloudflare Worker Entry Point
// Bridges Cloudflare Workers Static Assets & D1 API Endpoints

import { onRequestPost as authPost } from './functions/api/auth.js';
import { 
  onRequestGet as projectsGet,
  onRequestPost as projectsPost,
  onRequestPut as projectsPut,
  onRequestDelete as projectsDelete
} from './functions/api/projects.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const context = {
      request,
      env,
      ctx,
      params: {},
      waitUntil: (promise) => {
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(promise);
        }
      }
    };

    // 1. D1 Database API Routes
    if (path === '/api/auth' || path === '/api/auth/') {
      if (request.method === 'POST') {
        return await authPost(context);
      }
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/projects' || path === '/api/projects/') {
      if (request.method === 'GET') return await projectsGet(context);
      if (request.method === 'POST') return await projectsPost(context);
      if (request.method === 'PUT') return await projectsPut(context);
      if (request.method === 'DELETE') return await projectsDelete(context);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Static Asset Hosting via Cloudflare Assets binding
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
