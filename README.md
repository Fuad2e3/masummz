<div align="center">

# 🎬 Masum Mz — Creative Portfolio
### **Professional Video Editor & Graphic Designer Digital Showcase**

[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://hikmahcore.com/)
[![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Edge](https://img.shields.io/badge/Edge-Pages_Functions-F38020?style=for-the-badge&logoColor=white)](https://hikmahcore.com/)
[![Database](https://img.shields.io/badge/Database-D1_SQL-F38020?style=for-the-badge&logo=sqlite&logoColor=white)](https://hikmahcore.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**High-retention YouTube edits, viral Reels & Shorts, motion graphics, and high-CTR thumbnail showcase.**

---

[Explore Features](#-key-features) • [Visual Showcase](#-portfolio-showcase) • [Project Structure](#-project-structure) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 Overview
**Masum Mz** is a high-impact creative portfolio website built for a professional video editor and graphic designer. Engineered with modern vanilla HTML5, CSS3, JavaScript, and serverless edge infrastructure (Pages Functions + D1 SQL database), it presents an interactive media gallery, client testimonials, booking inquiry forms, and an administrative lead management console.

---

## ✨ Key Features

- 🎥 **High-Retention Video Showcase:** Interactive embedded video reel showcasing long-form YouTube editing and short-form TikTok/Reels pacing.
- 🎨 **Graphic Design & Thumbnail Wall:** High-resolution image lightbox featuring CTR-optimized YouTube thumbnails and branding designs.
- ⚡ **Edge-Powered Speed:** Fast global asset delivery hosted via Pages serverless edge functions.
- 🛡️ **Client Inquiries & Admin Portal:** Automated client contact capture synced to a serverless D1 SQLite database with an admin review panel (`admin.html`).
- 🌓 **Modern Typography & Glassmorphism:** Clean visual hierarchy with FontAwesome icons, responsive grids, and subtle hover animations.

---

## 📁 Project Structure

```text
masummz/
├── assets/                     # Media previews, cover photos & icons
├── admin/                      # Operations & inquiry management
├── functions/                  # Serverless edge functions
├── schema.sql                  # D1 database table definitions
├── wrangler.toml               # Edge worker deployment settings
├── index.html                  # Main creative portfolio page
├── admin.html                  # Admin lead management portal
├── style.css                   # Responsive layout & animation styling
├── script.js                   # Interactive filters, modals & form logic
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) | Ultra-lightweight zero-build client |
| **Edge Hosting** | Pages & Workers Functions | Distributed global CDN hosting |
| **Database** | D1 (SQL) | Contact inquiries & lead storage |
| **Icons & Fonts**| FontAwesome 6, Google Fonts | Polished creative iconography |

---

## 🚀 Edge Deployment Guide (`hikmahcore.com`)

### 1. Initialize D1 Database
Create the SQL database and bind your `database_id`:
```bash
npx wrangler d1 create masummz-db
```
Copy the generated `database_id` into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "masummz-db"
database_id = "67e1d5c0-1f6e-4818-b5e3-cbec3b720ad1"
```

Run schema initialization:
```bash
npx wrangler d1 execute masummz-db --remote --file=./schema.sql
```

### 2. Deploy Pages
Deploy directly via CLI or GitHub integration:

**CLI Deployment:**
```bash
npx wrangler pages deploy . --project-name=masummz
```

**Dashboard Integration (GitHub):**
1. Navigate to your Edge Provider Dashboard -> **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your GitHub repository `masummz`.
3. Set **Build Output Directory** to `.`.
4. Under **Settings** -> **Functions** -> **D1 Database Bindings**, bind `DB` to `masummz-db`.

### 3. Attach Custom Domain
1. In your Pages project, go to **Custom Domains** -> **Set up a custom domain**.
2. Enter `hikmahcore.com` (and `www.hikmahcore.com`).
3. Save and complete DNS propagation.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">

**Developed ❤️ by Softece**

</div>
