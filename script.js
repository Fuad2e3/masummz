// Masum Mz Portfolio - Interactive Video Editor Features & Audio Synthesizer

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navbar Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinksList = document.querySelectorAll('.nav-links a');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    navLinksList.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle?.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // 2. Active Nav Link & Scrolled Header
  const sections = document.querySelectorAll('section, header');
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (sectionId && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinksList.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 3. Theme Color Accent Switcher
  const themeBtns = document.querySelectorAll('.theme-dot');
  const savedAccent = localStorage.getItem('masum_accent_color');

  if (savedAccent) {
    applyAccentColor(savedAccent);
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      applyAccentColor(color);
      localStorage.setItem('masum_accent_color', color);
    });
  });

  function applyAccentColor(color) {
    const root = document.documentElement;
    themeBtns.forEach(b => b.classList.remove('active'));

    if (color === 'cyan') {
      root.style.setProperty('--primary-green', '#00f2fe');
      root.style.setProperty('--primary-hover', '#4facfe');
      root.style.setProperty('--glow-color', 'rgba(0, 242, 254, 0.45)');
      root.style.setProperty('--card-border', 'rgba(0, 242, 254, 0.25)');
    } else if (color === 'purple') {
      root.style.setProperty('--primary-green', '#bf55ec');
      root.style.setProperty('--primary-hover', '#d383f5');
      root.style.setProperty('--glow-color', 'rgba(191, 85, 236, 0.45)');
      root.style.setProperty('--card-border', 'rgba(191, 85, 236, 0.25)');
    } else if (color === 'amber') {
      root.style.setProperty('--primary-green', '#ffb703');
      root.style.setProperty('--primary-hover', '#ffc83b');
      root.style.setProperty('--glow-color', 'rgba(255, 183, 3, 0.45)');
      root.style.setProperty('--card-border', 'rgba(255, 183, 3, 0.25)');
    } else {
      root.style.setProperty('--primary-green', '#6ef028');
      root.style.setProperty('--primary-hover', '#8ced34');
      root.style.setProperty('--glow-color', 'rgba(110, 240, 40, 0.4)');
      root.style.setProperty('--card-border', 'rgba(110, 240, 40, 0.22)');
    }

    const activeBtn = document.querySelector(`.theme-dot[data-color="${color}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // 4. Ultra Reliable Stats Counter (IntersectionObserver)
  const statsSection = document.querySelector('.stats-bar');
  const statNumbers = document.querySelectorAll('.stat-number');
  let activeAnimIntervals = [];

  if (statsSection && statNumbers.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStatNumbers();
        } else {
          resetStatNumbers();
        }
      });
    }, observerOptions);

    statsObserver.observe(statsSection);
  }

  function animateStatNumbers() {
    activeAnimIntervals.forEach(id => clearInterval(id));
    activeAnimIntervals = [];

    statNumbers.forEach(num => {
      const target = parseInt(num.getAttribute('data-target') || '0', 10);
      const suffix = num.getAttribute('data-suffix') || '';
      let count = 0;
      const duration = 1200;
      const steps = 30;
      const stepTime = Math.floor(duration / steps);
      const stepValue = Math.max(1, Math.ceil(target / steps));

      const intervalId = setInterval(() => {
        count += stepValue;
        if (count >= target) {
          num.innerText = target + suffix;
          clearInterval(intervalId);
        } else {
          num.innerText = count + suffix;
        }
      }, stepTime);

      activeAnimIntervals.push(intervalId);
    });
  }

  function resetStatNumbers() {
    activeAnimIntervals.forEach(id => clearInterval(id));
    activeAnimIntervals = [];
    statNumbers.forEach(num => {
      const suffix = num.getAttribute('data-suffix') || '';
      num.innerText = '0' + suffix;
    });
  }

  // 5. Before vs After Interactive Comparison Slider
  const baSlider = document.getElementById('baSlider');
  const baAfterLayer = document.getElementById('baAfterLayer');
  const baHandle = document.getElementById('baHandle');

  if (baSlider && baAfterLayer && baHandle) {
    baSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      baAfterLayer.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
      baHandle.style.left = `${value}%`;
    });
  }

  // 6. Web Audio API SFX Synthesizer (Instant SFX Preview)
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const sfxBtns = document.querySelectorAll('.sfx-card');
  sfxBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sfxType = btn.getAttribute('data-sfx');
      playSynthesizedSFX(sfxType);

      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 400);
    });
  });

  function playSynthesizedSFX(type) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'whoosh') {
      // Whoosh sound: Noise sweep
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.3);

    } else if (type === 'chaching') {
      // Cash Register Cha-Ching: Dual High Sine Tones
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      osc2.frequency.setValueAtTime(1318.51, now);
      osc2.frequency.setValueAtTime(1758.4, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

    } else if (type === 'impact') {
      // Cinematic Impact Hit: Sub Kick + Noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

    } else if (type === 'pop') {
      // Pop Subtitle SFX: Short pitch pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // 7. Interactive Live Project Estimator
  const estType = document.getElementById('estType');
  const estLength = document.getElementById('estLength');
  const outTime = document.getElementById('outTime');
  const outRetention = document.getElementById('outRetention');

  function calculateEstimate() {
    if (!estType || !estLength || !outTime || !outRetention) return;

    const type = estType.value;
    const length = estLength.value;

    let timeText = '24 - 48 Hours';
    let retentionText = '+35% Avg Duration';

    if (type === 'shorts') {
      timeText = '24 Hours';
      retentionText = '+60% Completion Rate';
    } else if (type === 'youtube') {
      if (length === 'long') {
        timeText = '3 - 4 Days';
        retentionText = '+45% Avg Duration';
      } else {
        timeText = '2 - 3 Days';
        retentionText = '+35% Avg Duration';
      }
    } else if (type === 'motion') {
      timeText = '48 Hours';
      retentionText = 'High Visual Polish';
    }

    outTime.innerText = timeText;
    outRetention.innerText = retentionText;
  }

  if (estType && estLength) {
    estType.addEventListener('change', calculateEstimate);
    estLength.addEventListener('change', calculateEstimate);
  }

  // 8. Portfolio Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioCards.forEach(item => {
        const video = item.querySelector('video');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }

        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 9. Hover Auto-play Video & Pause All Others
  const allPortfolioVideos = document.querySelectorAll('.portfolio-video');

  function stopAllVideos() {
    allPortfolioVideos.forEach(v => {
      v.pause();
      v.currentTime = 0;
    });
    portfolioCards.forEach(c => c.classList.remove('playing'));
  }

  portfolioCards.forEach(card => {
    const video = card.querySelector('.portfolio-video');

    if (video) {
      card.addEventListener('mouseenter', () => {
        stopAllVideos();
        card.classList.add('playing');
        video.play().catch(err => console.log('Autoplay prevented:', err));
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('playing');
      });
    }

    card.addEventListener('click', () => {
      stopAllVideos();
      const title = card.querySelector('h3')?.innerText || 'Portfolio Video Preview';
      const desc = card.querySelector('p')?.innerText || '';
      const category = card.getAttribute('data-category') || 'Video Editing';
      const videoSrc = video?.getAttribute('src') || card.getAttribute('data-video-src');

      openModal(title, category, desc, videoSrc);
    });
  });

  // 10. Modal Enlarge Video Player
  const modal = document.getElementById('portfolioModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalDesc = document.getElementById('modalDesc');
  const modalMediaContainer = document.getElementById('modalMediaContainer');
  const modalClose = document.getElementById('modalClose');

  function openModal(title, category, desc, videoSrc) {
    if (modalTitle) modalTitle.innerText = title;
    if (modalCategory) modalCategory.innerText = category.toUpperCase();
    if (modalDesc) modalDesc.innerText = desc;

    if (modalMediaContainer) {
      if (videoSrc) {
        modalMediaContainer.innerHTML = `
          <div class="modal-video-wrapper">
            <video src="${videoSrc}" controls autoplay playsinline class="modal-large-video"></video>
          </div>
        `;
      } else {
        modalMediaContainer.innerHTML = `
          <div class="modal-placeholder-preview">
            <i class="fa-solid fa-play-circle modal-play-icon"></i>
            <p>High Quality Video Preview for <strong>${title}</strong></p>
          </div>
        `;
      }
    }

    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  if (modalClose && modal) {
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (modalMediaContainer) {
        const modalVid = modalMediaContainer.querySelector('video');
        if (modalVid) modalVid.pause();
        modalMediaContainer.innerHTML = '';
      }
    }
  }

  // 11. Copy to Clipboard & Toast Notification
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        });
      }
    });
  });

  function showToast(message) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 12. Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formSuccess = document.getElementById('formSuccess');
      if (formSuccess) {
        formSuccess.style.display = 'flex';
        contactForm.reset();
        showToast('Message sent successfully!');
        setTimeout(() => {
          formSuccess.style.display = 'none';
        }, 5000);
      }
    });
  }
});
