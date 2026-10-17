-- ========================================================
-- D1 Database Schema for Masum Mz Portfolio
-- Run this in D1 Console or via Wrangler:
-- npx wrangler d1 execute masummz-db --file=./schema.sql
-- ========================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  desc TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast ordering by sort_order
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order ASC, created_at DESC);

-- 2. Settings Table (For Admin PIN & Site Config)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin PIN (Default: 1234)
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_pin', '1234');

-- 3. Initial Seed Projects (Showcase Portfolio with Working Previews & Thumbnails)
INSERT OR IGNORE INTO projects (id, title, category, category_name, media_type, media_url, thumbnail_url, desc, sort_order) VALUES
('proj_1', 'YouTube Vlog & Storytelling Edit', 'video', 'Video Editing', 'video', 'https://www.youtube.com/watch?v=ScMzIvxBSi4', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', 'Pacing optimization, color grading, B-roll integration, and sound design.', 1),
('proj_2', 'Viral Podcast Clip (Alex Hormozi Style)', 'shorts', 'Shorts / Reels', 'video', 'https://www.youtube.com/shorts/50_uA3P4h5M', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80', 'Dynamic subtitles, pop-up graphics, SFX, and high retention cuts.', 2),
('proj_3', 'Motion Graphics & Visual FX Edit', 'video', 'Motion Graphics', 'video', 'https://www.youtube.com/watch?v=L_LUpnjgPso', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', 'Sleek motion graphics, logo animations, lower thirds, and callouts.', 3),
('proj_4', 'Fitness & Fashion Reels Edit', 'shorts', 'Shorts / Reels', 'video', 'https://www.youtube.com/shorts/aqz-KE-bpKQ', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', 'Beat synchronization, color enhancement, and energetic motion overlays.', 4),
('proj_5', 'High CTR Gaming & Tech Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', 'Vibrant colors, photo manipulation, facial enhancement, and bold text styling.', 5),
('proj_6', 'Finance & Crypto YouTube Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80', 'Custom 3D graphic elements, glow effects, and attention-grabbing typography.', 6);
