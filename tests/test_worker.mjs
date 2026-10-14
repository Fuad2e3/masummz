// Test Worker fetch routing and bindings
import worker from '../worker.js';

class MockD1 {
  constructor() {
    this.settings = new Map([['admin_pin', '1234']]);
    this.projects = [
      {
        id: 'proj_1',
        title: 'YouTube Vlog & Storytelling Edit',
        category: 'video',
        category_name: 'Video Editing',
        media_type: 'video',
        media_url: 'https://assets.mixkit.co/...mp4',
        desc: 'Pacing optimization, color grading...',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ];
  }

  prepare(sql) {
    const self = this;
    const stmt = {
      bind(...args) {
        return stmt;
      },
      async first() {
        if (sql.includes('SELECT value FROM settings WHERE key = ?')) {
          return { value: '1234' };
        }
        return null;
      },
      async all() {
        if (sql.includes('FROM projects')) {
          return { results: self.projects };
        }
        return { results: [] };
      },
      async run() {
        return { success: true };
      }
    };
    return stmt;
  }
}

async function run() {
  const env = {
    DB: new MockD1(),
    ASSETS: {
      async fetch(req) {
        return new Response('Mock Static Asset Content', { status: 200 });
      }
    }
  };

  // Test 1: GET /api/projects
  const reqProjects = new Request('https://hikmahcore.com/api/projects');
  const resProjects = await worker.fetch(reqProjects, env, {});
  const dataProjects = await resProjects.json();
  console.log('Test 1 - GET /api/projects status:', resProjects.status, 'results:', dataProjects.projects?.length);
  if (resProjects.status !== 200 || dataProjects.projects?.length !== 1) {
    throw new Error('Test 1 failed');
  }

  // Test 2: POST /api/auth
  const reqAuth = new Request('https://hikmahcore.com/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', pin: '1234' })
  });
  const resAuth = await worker.fetch(reqAuth, env, {});
  const dataAuth = await resAuth.json();
  console.log('Test 2 - POST /api/auth status:', resAuth.status, 'authenticated:', dataAuth.success);
  if (!dataAuth.success) {
    throw new Error('Test 2 failed');
  }

  // Test 3: Static Asset fallback
  const reqAsset = new Request('https://hikmahcore.com/style.css');
  const resAsset = await worker.fetch(reqAsset, env, {});
  const textAsset = await resAsset.text();
  console.log('Test 3 - Static Asset status:', resAsset.status, 'content:', textAsset);
  if (resAsset.status !== 200 || textAsset !== 'Mock Static Asset Content') {
    throw new Error('Test 3 failed');
  }

  console.log('✅ ALL WORKER TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
