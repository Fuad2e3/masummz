// Cloudflare Pages Function: /api/projects
// Full CRUD for Portfolio Projects backed by Cloudflare D1 SQL Database

// Helper: Verify PIN from Header or Query
async function isAuthorized(request, env) {
  if (!env.DB) return true; // If D1 not bound yet, pass through to allow fallback
  const authPin = request.headers.get('x-admin-pin');
  if (!authPin) return false;

  const pinRow = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
    .bind('admin_pin')
    .first();

  const validPin = pinRow ? pinRow.value : '1234';
  return authPin === validPin;
}

// 1. GET: Fetch all projects from Cloudflare D1
export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ fallback: true, projects: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(`
      SELECT 
        id, 
        title, 
        category, 
        category_name AS categoryName, 
        media_type AS mediaType, 
        media_url AS mediaUrl, 
        desc, 
        sort_order AS sortOrder 
      FROM projects 
      ORDER BY sort_order ASC, created_at DESC
    `).all();

    return new Response(JSON.stringify({ success: true, projects: results || [] }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=60'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 2. POST: Add a new project or Reset to defaults
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!await isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    if (!env.DB) {
      return new Response(JSON.stringify({ fallback: true, saved: body }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle batch reorder or reset
    if (body.action === 'reset_defaults') {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM projects'),
        env.DB.prepare(`
          INSERT INTO projects (id, title, category, category_name, media_type, media_url, desc, sort_order) VALUES
          ('proj_1', 'YouTube Vlog & Storytelling Edit', 'video', 'Video Editing', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-working-on-a-video-editing-software-41618-large.mp4', 'Pacing optimization, color grading, B-roll integration, and sound design.', 1),
          ('proj_2', 'Viral Podcast Clip (Alex Hormozi Style)', 'shorts', 'Shorts / Reels', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-young-man-recording-a-video-blog-41589-large.mp4', 'Dynamic subtitles, pop-up graphics, SFX, and high retention cuts.', 2),
          ('proj_3', 'Motion Graphics & Visual FX Edit', 'video', 'Motion Graphics', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-editing-a-video-on-a-computer-41617-large.mp4', 'Sleek motion graphics, logo animations, lower thirds, and callouts.', 3),
          ('proj_4', 'Fitness & Fashion Reels Edit', 'shorts', 'Shorts / Reels', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-for-a-photoshoot-41584-large.mp4', 'Beat synchronization, color enhancement, and energetic motion overlays.', 4),
          ('proj_5', 'High CTR Gaming & Tech Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://assets.mixkit.co/videos/preview/mixkit-creative-designer-working-on-a-tablet-41588-large.mp4', 'Vibrant colors, photo manipulation, facial enhancement, and bold text styling.', 5),
          ('proj_6', 'Finance & Crypto YouTube Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-video-game-41585-large.mp4', 'Custom 3D graphic elements, glow effects, and attention-grabbing typography.', 6)
        `)
      ]);
      return new Response(JSON.stringify({ success: true, message: 'Defaults restored' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle batch reorder
    if (body.action === 'reorder' && Array.isArray(body.orders)) {
      const statements = body.orders.map(item =>
        env.DB.prepare('UPDATE projects SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(item.sortOrder, item.id)
      );
      await env.DB.batch(statements);
      return new Response(JSON.stringify({ success: true, message: 'Projects reordered' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Standard Add New Project
    const id = body.id || ('proj_' + Date.now());
    const title = body.title || 'Untitled Project';
    const category = body.category || 'video';
    const categoryName = body.categoryName || 'Video Editing';
    const mediaType = body.mediaType || 'video';
    const mediaUrl = body.mediaUrl || '';
    const desc = body.desc || '';
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0;

    await env.DB.prepare(`
      INSERT INTO projects (id, title, category, category_name, media_type, media_url, desc, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, title, category, categoryName, mediaType, mediaUrl, desc, sortOrder).run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error inserting project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 3. PUT: Update an existing project
export async function onRequestPut(context) {
  const { request, env } = context;

  if (!await isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Missing project id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ fallback: true, updated: body }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`
      UPDATE projects 
      SET 
        title = ?, 
        category = ?, 
        category_name = ?, 
        media_type = ?, 
        media_url = ?, 
        desc = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title,
      body.category,
      body.categoryName,
      body.mediaType,
      body.mediaUrl,
      body.desc,
      body.id
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Project updated' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error updating project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 4. DELETE: Remove project by ID
export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!await isAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing project id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ fallback: true, deleted: id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true, message: 'Project deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error deleting project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
