// Masum Mz - Admin Management & PIN Authentication Script
(function () {
  'use strict';

  // Constants & Storage Keys
  const PIN_KEY = 'masummz_admin_pin';
  const AUTH_KEY = 'masummz_admin_auth';
  const PROJECTS_KEY = 'masummz_portfolio_projects';
  const DEFAULT_PIN = '1234';

  // Default Initial Projects (matches original portfolio with working video & cover URLs)
  const DEFAULT_PROJECTS = [
    {
      id: 'proj_1',
      title: 'YouTube Vlog & Storytelling Edit',
      category: 'video',
      categoryName: 'Video Editing',
      mediaType: 'video',
      mediaUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      desc: 'Pacing optimization, color grading, B-roll integration, and sound design.'
    },
    {
      id: 'proj_2',
      title: 'Viral Podcast Clip (Alex Hormozi Style)',
      category: 'shorts',
      categoryName: 'Shorts / Reels',
      mediaType: 'video',
      mediaUrl: 'https://www.youtube.com/shorts/50_uA3P4h5M',
      thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      desc: 'Dynamic subtitles, pop-up graphics, SFX, and high retention cuts.'
    },
    {
      id: 'proj_3',
      title: 'Motion Graphics & Visual FX Edit',
      category: 'video',
      categoryName: 'Motion Graphics',
      mediaType: 'video',
      mediaUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      desc: 'Sleek motion graphics, logo animations, lower thirds, and callouts.'
    },
    {
      id: 'proj_4',
      title: 'Fitness & Fashion Reels Edit',
      category: 'shorts',
      categoryName: 'Shorts / Reels',
      mediaType: 'video',
      mediaUrl: 'https://www.youtube.com/shorts/aqz-KE-bpKQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
      desc: 'Beat synchronization, color enhancement, and energetic motion overlays.'
    },
    {
      id: 'proj_5',
      title: 'High CTR Gaming & Tech Thumbnail',
      category: 'thumbnail',
      categoryName: 'Thumbnail Design',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      desc: 'Vibrant colors, photo manipulation, facial enhancement, and bold text styling.'
    },
    {
      id: 'proj_6',
      title: 'Finance & Crypto YouTube Thumbnail',
      category: 'thumbnail',
      categoryName: 'Thumbnail Design',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
      desc: 'Custom 3D graphic elements, glow effects, and attention-grabbing typography.'
    }
  ];

  // Helper: Universal Media Parser (Supports YouTube, Vimeo, Drive, Direct MP4 & Images)
  function parseMedia(url, explicitType = null, customThumbnail = null) {
    if (!url) {
      return {
        type: explicitType || 'image',
        provider: 'unknown',
        url: '',
        thumbnailUrl: customThumbnail || '',
        embedUrl: '',
        isEmbed: false
      };
    }

    const cleanUrl = String(url).trim();

    // 1. YouTube (standard, youtu.be, shorts, embed)
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const defaultThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      return {
        type: 'video',
        provider: 'youtube',
        videoId,
        url: cleanUrl,
        thumbnailUrl: customThumbnail || defaultThumb,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
        isEmbed: true
      };
    }

    // 2. Vimeo
    const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/)(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      return {
        type: 'video',
        provider: 'vimeo',
        videoId,
        url: cleanUrl,
        thumbnailUrl: customThumbnail || '',
        embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
        isEmbed: true
      };
    }

    // 3. Google Drive
    const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      return {
        type: 'video',
        provider: 'gdrive',
        fileId,
        url: cleanUrl,
        thumbnailUrl: customThumbnail || '',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        isEmbed: true
      };
    }

    // 4. Direct video (mp4, webm, mov, m4v, ogg) or explicit type === 'video'
    const isVideoFile = cleanUrl.match(/\.(mp4|webm|mov|m4v|ogg)($|\?)/i) || explicitType === 'video';
    if (isVideoFile && explicitType !== 'image') {
      return {
        type: 'video',
        provider: 'direct',
        url: cleanUrl,
        thumbnailUrl: customThumbnail || '',
        embedUrl: '',
        isEmbed: false
      };
    }

    // 5. Image
    return {
      type: 'image',
      provider: 'image',
      url: cleanUrl,
      thumbnailUrl: customThumbnail || cleanUrl,
      embedUrl: '',
      isEmbed: false
    };
  }

  // DOM Elements
  const pinScreen = document.getElementById('pinScreen');
  const pinInput = document.getElementById('pinInput');
  const pinAuthForm = document.getElementById('pinAuthForm');
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const pinSubmitBtn = document.getElementById('pinSubmitBtn');
  const togglePinVisibility = document.getElementById('togglePinVisibility');
  const logoutBtn = document.getElementById('logoutBtn');
  const projectsGrid = document.getElementById('adminProjectsGrid');
  const projectModal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const projectForm = document.getElementById('projectForm');
  const modalTitle = document.getElementById('modalTitle');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const changePinBtn = document.getElementById('changePinBtn');
  const changePinModal = document.getElementById('changePinModal');
  const changePinCloseBtn = document.getElementById('changePinCloseBtn');
  const changePinCancelBtn = document.getElementById('changePinCancelBtn');
  const changePinForm = document.getElementById('changePinForm');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const mediaUrlInput = document.getElementById('mediaUrl');
  const mediaTypeSelect = document.getElementById('mediaType');
  const thumbnailUrlInput = document.getElementById('thumbnailUrl');
  const previewBox = document.getElementById('previewBox');
  const toastContainer = document.getElementById('toastContainer');

  // Stats elements
  const statTotal = document.getElementById('statTotal');
  const statVideos = document.getElementById('statVideos');
  const statShorts = document.getElementById('statShorts');
  const statThumbnails = document.getElementById('statThumbnails');

  let currentFilter = 'all';
  let editingProjectId = null;

  // Initialize
  initPinSystem();
  initProjectsData();

  // ==========================================
  // 1. PIN AUTHENTICATION SYSTEM
  // ==========================================
  function getStoredPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function setStoredPin(newPin) {
    localStorage.setItem(PIN_KEY, newPin);
  }

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }

  function initPinSystem() {
    if (isAuthenticated()) {
      unlockDashboard();
    } else {
      lockDashboard();
    }

    // Submit PIN Click
    if (pinSubmitBtn) {
      pinSubmitBtn.addEventListener('click', verifyPin);
    }

    // Form & Enter key submission
    if (pinAuthForm) {
      pinAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        verifyPin();
      });
    }

    if (pinInput) {
      pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          verifyPin();
        }
      });
      pinInput.addEventListener('input', () => {
        if (pinErrorMsg) pinErrorMsg.innerText = '';
      });
    }

    // Toggle Pin Visibility
    if (togglePinVisibility) {
      togglePinVisibility.addEventListener('click', () => {
        const isPassword = pinInput.getAttribute('type') === 'password';
        pinInput.setAttribute('type', isPassword ? 'text' : 'password');
        togglePinVisibility.innerHTML = isPassword
          ? '<i class="fa-solid fa-eye-slash"></i>'
          : '<i class="fa-solid fa-eye"></i>';
      });
    }

    // Logout Click
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem(AUTH_KEY);
        lockDashboard();
        showToast('Logged out of Admin Panel');
      });
    }
  }

  async function verifyPin() {
    const entered = pinInput.value.trim();
    const correctPin = getStoredPin();

    let isValid = (entered === correctPin);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', pin: entered })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && !data.fallback) {
          isValid = true;
          setStoredPin(entered);
        }
      } else if (res.status === 401) {
        isValid = false;
      }
    } catch (e) {
      // Local fallback
    }

    if (isValid) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      unlockDashboard();
      showToast('Welcome back, Masum Mz!');
      pinInput.value = '';
      pinErrorMsg.innerText = '';
      fetchProjectsFromD1();
    } else {
      const card = document.querySelector('.pin-card');
      if (card) {
        card.classList.remove('shake-anim');
        void card.offsetWidth; // Trigger reflow
        card.classList.add('shake-anim');
      }
      pinErrorMsg.innerText = 'Incorrect PIN! (Default is ' + correctPin + ')';
      pinInput.value = '';
      pinInput.focus();
    }
  }

  function lockDashboard() {
    if (pinScreen) pinScreen.classList.remove('hidden');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 300);
    }
  }

  function unlockDashboard() {
    if (pinScreen) pinScreen.classList.add('hidden');
    renderProjects();
    updateStats();
  }

  // ==========================================
  // 2. CHANGE SECURITY PIN
  // ==========================================
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      changePinModal.classList.add('open');
      document.getElementById('currentPin').value = '';
      document.getElementById('newPin').value = '';
      document.getElementById('confirmNewPin').value = '';
    });
  }

  if (changePinCloseBtn) changePinCloseBtn.addEventListener('click', closeChangePinModal);
  if (changePinCancelBtn) changePinCancelBtn.addEventListener('click', closeChangePinModal);

  function closeChangePinModal() {
    if (changePinModal) changePinModal.classList.remove('open');
  }

  if (changePinForm) {
    changePinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPinVal = document.getElementById('currentPin').value.trim();
      const newPinVal = document.getElementById('newPin').value.trim();
      const confirmPinVal = document.getElementById('confirmNewPin').value.trim();

      if (currentPinVal !== getStoredPin()) {
        showToast('Current PIN is incorrect!', true);
        return;
      }

      if (newPinVal.length < 4) {
        showToast('New PIN must be at least 4 digits!', true);
        return;
      }

      if (newPinVal !== confirmPinVal) {
        showToast('New PIN and Confirmation do not match!', true);
        return;
      }

      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'change_pin', currentPin: currentPinVal, newPin: newPinVal })
        });
      } catch (err) {}

      setStoredPin(newPinVal);
      closeChangePinModal();
      showToast('Security PIN changed successfully!');
    });
  }

  // ==========================================
  // 3. PROJECTS DATA & STORAGE MANAGEMENT
  // ==========================================
  function initProjectsData() {
    const existing = localStorage.getItem(PROJECTS_KEY);
    if (!existing) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
    }
    fetchProjectsFromD1();
  }

  async function fetchProjectsFromD1() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.projects) && data.projects.length > 0) {
          localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects));
          renderProjects();
          updateStats();
        }
      }
    } catch (e) {}
  }

  function getProjects() {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch (err) {
      console.error('Error parsing projects:', err);
      return DEFAULT_PROJECTS;
    }
  }

  function saveProjects(projects) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    renderProjects();
    updateStats();
    // Dispatch custom event to notify open portfolio windows
    window.dispatchEvent(new Event('storage'));
  }

  function updateStats() {
    const list = getProjects();
    if (statTotal) statTotal.innerText = list.length;
    if (statVideos) statVideos.innerText = list.filter(p => p.category === 'video').length;
    if (statShorts) statShorts.innerText = list.filter(p => p.category === 'shorts').length;
    if (statThumbnails) statThumbnails.innerText = list.filter(p => p.category === 'thumbnail').length;
  }

  function renderProjects() {
    if (!projectsGrid) return;
    const all = getProjects();
    const filtered = currentFilter === 'all'
      ? all
      : all.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
      projectsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <h3>No Projects Found</h3>
          <p>No projects match this category. Click 'Add Project' to create one!</p>
          <button class="btn-primary" onclick="document.getElementById('openAddModalBtn').click()">
            <i class="fa-solid fa-plus"></i> Add New Project
          </button>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = filtered.map((proj, idx) => {
      const parsed = parseMedia(proj.mediaUrl, proj.mediaType, proj.thumbnailUrl);
      let mediaHtml;

      if (parsed.type === 'video') {
        const coverImg = parsed.thumbnailUrl || (parsed.isEmbed && parsed.provider === 'youtube' ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg` : '');
        if (coverImg) {
          mediaHtml = `
            <div style="position:relative;width:100%;height:100%;">
              <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(proj.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">
              <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
                <i class="fa-solid fa-play" style="color:#00ff88;font-size:1.4rem;filter:drop-shadow(0 0 10px rgba(0,255,136,0.7));"></i>
              </div>
            </div>
          `;
        } else if (parsed.provider === 'direct') {
          mediaHtml = `<video src="${escapeHtml(proj.mediaUrl)}" muted loop playsinline onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>`;
        } else {
          mediaHtml = `<div style="width:100%;height:100%;background:#091209;display:flex;align-items:center;justify-content:center;color:#00ff88;"><i class="fa-solid fa-video fa-2x"></i></div>`;
        }
      } else {
        mediaHtml = `<img src="${escapeHtml(proj.thumbnailUrl || proj.mediaUrl)}" alt="${escapeHtml(proj.title)}" loading="lazy">`;
      }

      const globalIndex = all.findIndex(item => item.id === proj.id);

      return `
        <div class="admin-project-card" data-id="${proj.id}">
          <div class="admin-card-preview">
            ${mediaHtml}
            <span class="admin-card-badge">${escapeHtml(proj.categoryName || getCategoryLabel(proj.category))}</span>
          </div>
          <div class="admin-card-body">
            <h3 class="admin-card-title">${escapeHtml(proj.title)}</h3>
            <p class="admin-card-desc">${escapeHtml(proj.desc || 'No description provided.')}</p>
            <div class="admin-card-footer">
              <div class="reorder-btns">
                <button class="reorder-btn" title="Move Up" onclick="window.adminMoveProject(${globalIndex}, -1)" ${globalIndex === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
                <button class="reorder-btn" title="Move Down" onclick="window.adminMoveProject(${globalIndex}, 1)" ${globalIndex === all.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                  <i class="fa-solid fa-arrow-down"></i>
                </button>
              </div>
              <div class="card-actions">
                <button class="action-edit-btn" onclick="window.adminEditProject('${proj.id}')">
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="action-delete-btn" onclick="window.adminDeleteProject('${proj.id}')">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getCategoryLabel(cat) {
    if (cat === 'video') return 'Video Editing';
    if (cat === 'shorts') return 'Shorts / Reels';
    if (cat === 'thumbnail') return 'Thumbnails & Design';
    return cat.toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 4. CATEGORY FILTER TABS
  // ==========================================
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderProjects();
    });
  });

  // ==========================================
  // 5. ADD / EDIT PROJECT MODAL
  // ==========================================
  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', () => {
      editingProjectId = null;
      modalTitle.innerText = 'Add New Project';
      projectForm.reset();
      if (thumbnailUrlInput) thumbnailUrlInput.value = '';
      previewBox.style.display = 'none';
      previewBox.innerHTML = '';
      projectModal.classList.add('open');
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

  function closeModal() {
    if (projectModal) projectModal.classList.remove('open');
  }

  // Live media preview in form
  if (mediaUrlInput) {
    mediaUrlInput.addEventListener('input', updateMediaPreview);
  }
  if (mediaTypeSelect) {
    mediaTypeSelect.addEventListener('change', updateMediaPreview);
  }
  if (thumbnailUrlInput) {
    thumbnailUrlInput.addEventListener('input', updateMediaPreview);
  }

  function updateMediaPreview() {
    const url = mediaUrlInput ? mediaUrlInput.value.trim() : '';
    const type = mediaTypeSelect ? mediaTypeSelect.value : 'video';
    const customThumb = thumbnailUrlInput ? thumbnailUrlInput.value.trim() : '';

    if (!url) {
      previewBox.style.display = 'none';
      previewBox.innerHTML = '';
      return;
    }

    const parsed = parseMedia(url, type, customThumb);
    previewBox.style.display = 'flex';

    if (parsed.isEmbed && parsed.provider === 'youtube') {
      previewBox.innerHTML = `
        <div style="position:relative;width:100%;max-width:320px;text-align:center;">
          <img src="${parsed.thumbnailUrl}" alt="YouTube Preview" style="width:100%;height:160px;object-fit:cover;border-radius:6px;">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:#00ff88;padding:8px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:6px;box-shadow:0 0 15px rgba(0,255,136,0.4);">
            <i class="fa-brands fa-youtube" style="color:#ff0000;font-size:1.2rem;"></i> YouTube Video Detected
          </div>
        </div>
      `;
    } else if (parsed.type === 'video' && parsed.provider === 'direct') {
      previewBox.innerHTML = `<video src="${url}" poster="${parsed.thumbnailUrl || ''}" controls autoplay muted playsinline style="max-height:180px;width:100%;"></video>`;
    } else {
      const displayImg = parsed.thumbnailUrl || url;
      previewBox.innerHTML = `<img src="${displayImg}" alt="Preview" style="max-height:180px;max-width:100%;object-fit:contain;">`;
    }
  }

  // Form Submit (Save / Update)
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('projectTitle').value.trim();
      const category = document.getElementById('projectCategory').value;
      const mediaType = document.getElementById('mediaType').value;
      const mediaUrl = document.getElementById('mediaUrl').value.trim();
      const thumbnailUrl = thumbnailUrlInput ? thumbnailUrlInput.value.trim() : '';
      const desc = document.getElementById('projectDesc').value.trim();

      if (!title || !mediaUrl) {
        showToast('Please enter both title and media URL!', true);
        return;
      }

      const projects = getProjects();

      if (editingProjectId) {
        // Edit existing
        const idx = projects.findIndex(p => p.id === editingProjectId);
        if (idx !== -1) {
          const updatedItem = {
            ...projects[idx],
            title,
            category,
            categoryName: getCategoryLabel(category),
            mediaType,
            mediaUrl,
            thumbnailUrl,
            desc
          };
          projects[idx] = updatedItem;
          saveProjects(projects);
          showToast('Project updated successfully!');

          // Sync with D1 API
          try {
            await fetch('/api/projects', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-pin': getStoredPin()
              },
              body: JSON.stringify(updatedItem)
            });
          } catch (err) {}
        }
      } else {
        // Add new
        const newProj = {
          id: 'proj_' + Date.now(),
          title,
          category,
          categoryName: getCategoryLabel(category),
          mediaType,
          mediaUrl,
          thumbnailUrl,
          desc,
          sortOrder: 0
        };
        projects.unshift(newProj);
        saveProjects(projects);
        showToast('New project added to portfolio!');

        // Sync with D1 API
        try {
          await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-pin': getStoredPin()
            },
            body: JSON.stringify(newProj)
          });
        } catch (err) {}
      }

      closeModal();
    });
  }

  // Expose global actions for inline handlers
  window.adminEditProject = function (id) {
    const projects = getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    editingProjectId = id;
    modalTitle.innerText = 'Edit Project';

    document.getElementById('projectTitle').value = proj.title || '';
    document.getElementById('projectCategory').value = proj.category || 'video';
    document.getElementById('mediaType').value = proj.mediaType || 'video';
    document.getElementById('mediaUrl').value = proj.mediaUrl || '';
    if (thumbnailUrlInput) {
      thumbnailUrlInput.value = proj.thumbnailUrl || '';
    }
    document.getElementById('projectDesc').value = proj.desc || '';

    updateMediaPreview();
    projectModal.classList.add('open');
  };

  window.adminDeleteProject = async function (id) {
    if (!confirm('Are you sure you want to delete this project from the portfolio?')) {
      return;
    }
    const projects = getProjects().filter(p => p.id !== id);
    saveProjects(projects);
    showToast('Project deleted');

    // Sync with D1 API
    try {
      await fetch('/api/projects?id=' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { 'x-admin-pin': getStoredPin() }
      });
    } catch (err) {}
  };

  window.adminMoveProject = async function (index, direction) {
    const projects = getProjects();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const temp = projects[index];
    projects[index] = projects[targetIndex];
    projects[targetIndex] = temp;

    saveProjects(projects);

    // Sync order with D1 API
    try {
      const orders = projects.map((p, idx) => ({ id: p.id, sortOrder: idx + 1 }));
      await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': getStoredPin()
        },
        body: JSON.stringify({ action: 'reorder', orders })
      });
    } catch (err) {}
  };

  // ==========================================
  // 6. BACKUP, EXPORT & RESET TO DEFAULTS
  // ==========================================
  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', async () => {
      if (confirm('Reset to default 6 showcase projects? Your custom additions will be replaced.')) {
        saveProjects(DEFAULT_PROJECTS);
        showToast('Restored default portfolio projects');

        // Sync with D1 API
        try {
          await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-pin': getStoredPin()
            },
            body: JSON.stringify({ action: 'reset_defaults' })
          });
        } catch (err) {}
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getProjects(), null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'masummz_portfolio_backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Projects exported as JSON backup');
    });
  }

  // Toast Notification Utility
  function showToast(message, isError = false) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
      <span>${escapeHtml(message)}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

})();
