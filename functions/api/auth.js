// Cloudflare Pages Function: /api/auth
// Validates and manages Security PIN stored in Cloudflare D1 (settings table)

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const action = body.action || 'verify';

    // Fallback if D1 is not bound yet
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: true,
        fallback: true,
        message: 'D1 not configured; client fallback active'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch current PIN from D1 settings table (default 1234)
    const pinRow = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('admin_pin')
      .first();

    const storedPin = pinRow ? pinRow.value : '1234';

    // 1. Verify PIN
    if (action === 'verify') {
      const enteredPin = String(body.pin || '').trim();
      if (enteredPin === storedPin) {
        return new Response(JSON.stringify({ success: true, message: 'Authenticated' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ success: false, error: 'Incorrect PIN' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Change PIN
    if (action === 'change_pin') {
      const currentPin = String(body.currentPin || '').trim();
      const newPin = String(body.newPin || '').trim();

      if (currentPin !== storedPin) {
        return new Response(JSON.stringify({ success: false, error: 'Current PIN is incorrect' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!newPin || newPin.length < 4) {
        return new Response(JSON.stringify({ success: false, error: 'New PIN must be at least 4 digits' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP')
        .bind('admin_pin', newPin, newPin)
        .run();

      return new Response(JSON.stringify({ success: true, message: 'PIN updated successfully in D1' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
