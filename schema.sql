-- ========================================================
-- Cloudflare D1 Database Schema for Masum Mz Portfolio
-- Run this in Cloudflare D1 Console or via Wrangler:
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

-- 3. Initial Seed Projects (Showcase Portfolio)
INSERT OR IGNORE INTO projects (id, title, category, category_name, media_type, media_url, desc, sort_order) VALUES
('proj_1', 'YouTube Vlog & Storytelling Edit', 'video', 'Video Editing', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-working-on-a-video-editing-software-41618-large.mp4', 'Pacing optimization, color grading, B-roll integration, and sound design.', 1),
('proj_2', 'Viral Podcast Clip (Alex Hormozi Style)', 'shorts', 'Shorts / Reels', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-young-man-recording-a-video-blog-41589-large.mp4', 'Dynamic subtitles, pop-up graphics, SFX, and high retention cuts.', 2),
('proj_3', 'Motion Graphics & Visual FX Edit', 'video', 'Motion Graphics', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-editing-a-video-on-a-computer-41617-large.mp4', 'Sleek motion graphics, logo animations, lower thirds, and callouts.', 3),
('proj_4', 'Fitness & Fashion Reels Edit', 'shorts', 'Shorts / Reels', 'video', 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-for-a-photoshoot-41584-large.mp4', 'Beat synchronization, color enhancement, and energetic motion overlays.', 4),
('proj_5', 'High CTR Gaming & Tech Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://assets.mixkit.co/videos/preview/mixkit-creative-designer-working-on-a-tablet-41588-large.mp4', 'Vibrant colors, photo manipulation, facial enhancement, and bold text styling.', 5),
('proj_6', 'Finance & Crypto YouTube Thumbnail', 'thumbnail', 'Thumbnail Design', 'image', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-video-game-41585-large.mp4', 'Custom 3D graphic elements, glow effects, and attention-grabbing typography.', 6);
