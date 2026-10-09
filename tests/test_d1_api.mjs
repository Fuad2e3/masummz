// Comprehensive Test Suite for Cloudflare D1 Pages Functions
// Tests: Auth (/api/auth) and Projects CRUD (/api/projects)

import { onRequestPost as authHandler } from '../functions/api/auth.js';
import { 
  onRequestGet as getProjects,
  onRequestPost as postProjects,
  onRequestPut as putProjects,
  onRequestDelete as deleteProjects
} from '../functions/api/projects.js';

// In-Memory SQLite-like mock for Cloudflare D1 Database
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
      },
      {
        id: 'proj_2',
        title: 'Viral Podcast Clip',
        category: 'shorts',
        category_name: 'Shorts / Reels',
        media_type: 'video',
        media_url: 'https://assets.mixkit.co/...mp4',
        desc: 'Dynamic subtitles, pop-up graphics...',
        sort_order: 2,
        created_at: new Date().toISOString()
      }
    ];
  }

  prepare(sql) {
    const self = this;
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes('SELECT value FROM settings WHERE key = ?')) {
              const val = self.settings.get(args[0]);
              return val ? { value: val } : null;
            }
            return null;
          },
          async all() {
            if (sql.includes('FROM projects')) {
              // Return projects sorted
              const sorted = [...self.projects].sort((a, b) => a.sort_order - b.sort_order);
              return {
                results: sorted.map(p => ({
                  id: p.id,
                  title: p.title,
                  category: p.category,
                  categoryName: p.category_name,
                  mediaType: p.media_type,
                  mediaUrl: p.media_url,
                  desc: p.desc,
                  sortOrder: p.sort_order
                }))
              };
            }
            return { results: [] };
          },
          async run() {
            if (sql.includes('INSERT INTO settings')) {
              self.settings.set(args[0], args[1]);
              return { success: true };
            }
            if (sql.includes('INSERT INTO projects')) {
              self.projects.push({
                id: args[0],
                title: args[1],
                category: args[2],
                category_name: args[3],
                media_type: args[4],
                media_url: args[5],
                desc: args[6],
                sort_order: args[7] || 0,
                created_at: new Date().toISOString()
              });
              return { success: true };
            }
            if (sql.includes('UPDATE projects') && sql.includes('WHERE id = ?')) {
              const item = self.projects.find(p => p.id === args[6]);
              if (item) {
                item.title = args[0];
                item.category = args[1];
                item.category_name = args[2];
                item.media_type = args[3];
                item.media_url = args[4];
                item.desc = args[5];
              }
              return { success: true };
            }
            if (sql.includes('UPDATE projects') && sql.includes('sort_order = ?')) {
              const item = self.projects.find(p => p.id === args[1]);
              if (item) item.sort_order = args[0];
              return { success: true };
            }
            if (sql.includes('DELETE FROM projects WHERE id = ?')) {
              self.projects = self.projects.filter(p => p.id !== args[0]);
              return { success: true };
            }
            return { success: true };
          }
        };
      },
      async all() {
        return this.bind().all();
      }
    };
  }

  async batch(statements) {
    for (const stmt of statements) {
      await stmt.run();
    }
    return [];
  }
}

// Test Runner
async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING CLOUDFLARE D1 & PAGES FUNCTIONS TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const mockDb = new MockD1();
  const env = { DB: mockDb };

  // ----------------------------------------------------
  // GROUP 1: AUTHENTICATION TESTS (/api/auth)
  // ----------------------------------------------------
  console.log('--- 1. Testing PIN Authentication & Management ---');

  // Test 1.1: Default PIN 1234
  {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', pin: '1234' })
    });
    const res = await authHandler({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'Default PIN (1234) verified successfully');
  }

  // Test 1.2: Incorrect PIN
  {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', pin: '9999' })
    });
    const res = await authHandler({ request: req, env });
    const data = await res.json();
    assert(res.status === 401 && data.success === false, 'Incorrect PIN correctly rejected with 401');
  }

  // Test 1.3: Change PIN
  {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'change_pin', currentPin: '1234', newPin: '5678' })
    });
    const res = await authHandler({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'PIN successfully changed to 5678');
  }

  // Test 1.4: Verify with new PIN
  {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', pin: '5678' })
    });
    const res = await authHandler({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'New PIN (5678) verified in D1');
  }

  // Reset PIN back to 1234 for subsequent tests
  mockDb.settings.set('admin_pin', '1234');

  // ----------------------------------------------------
  // GROUP 2: PROJECTS CRUD TESTS (/api/projects)
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Projects Data Storage & Loading ---');

  // Test 2.1: GET initial projects
  {
    const res = await getProjects({ env });
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.projects) && data.projects.length === 2, 'Initial projects loaded successfully from D1');
  }

  // Test 2.2: POST Unauthorized (Missing PIN header)
  {
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacker Edit' })
    });
    const res = await postProjects({ request: req, env });
    assert(res.status === 401, 'Unauthorized POST rejected without PIN header');
  }

  // Test 2.3: POST Add New Project
  const newProject = {
    id: 'proj_test_99',
    title: 'Cinematic Documentary Edit',
    category: 'video',
    categoryName: 'Video Editing',
    mediaType: 'video',
    mediaUrl: 'https://example.com/test-documentary.mp4',
    desc: 'Deep pacing, dramatic color grade, and sound design.',
    sortOrder: 0
  };

  {
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-pin': '1234'
      },
      body: JSON.stringify(newProject)
    });
    const res = await postProjects({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && data.id === newProject.id, 'New project stored in D1 database');
  }

  // Test 2.4: Verify new project is loaded by GET
  {
    const res = await getProjects({ env });
    const data = await res.json();
    const found = data.projects.find(p => p.id === newProject.id);
    assert(found && found.title === 'Cinematic Documentary Edit', 'New project accurately retrieved in GET list');
  }

  // Test 2.5: PUT Edit Project
  {
    const updated = {
      ...newProject,
      title: 'Cinematic Documentary (Remastered 4K)'
    };
    const req = new Request('http://localhost/api/projects', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-pin': '1234'
      },
      body: JSON.stringify(updated)
    });
    const res = await putProjects({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'Project updated in D1 database');

    // Confirm update in GET
    const getRes = await getProjects({ env });
    const getData = await getRes.json();
    const item = getData.projects.find(p => p.id === newProject.id);
    assert(item.title === 'Cinematic Documentary (Remastered 4K)', 'Updated title confirmed in database');
  }

  // Test 2.6: POST Reorder Projects
  {
    const reorderPayload = {
      action: 'reorder',
      orders: [
        { id: newProject.id, sortOrder: 1 },
        { id: 'proj_1', sortOrder: 2 },
        { id: 'proj_2', sortOrder: 3 }
      ]
    };
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-pin': '1234'
      },
      body: JSON.stringify(reorderPayload)
    });
    const res = await postProjects({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'Projects successfully reordered in D1');

    // Confirm order in GET
    const getRes = await getProjects({ env });
    const getData = await getRes.json();
    assert(getData.projects[0].id === newProject.id, 'Reordered project is now first in the list');
  }

  // Test 2.7: DELETE Project
  {
    const req = new Request(`http://localhost/api/projects?id=${newProject.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': '1234' }
    });
    const res = await deleteProjects({ request: req, env });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'Project deleted from D1');

    // Confirm removal in GET
    const getRes = await getProjects({ env });
    const getData = await getRes.json();
    const stillExists = getData.projects.some(p => p.id === newProject.id);
    assert(!stillExists, 'Deleted project no longer exists in D1 database');
  }

  console.log('\n========================================================');
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
