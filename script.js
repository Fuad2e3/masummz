// Masum Mz Portfolio - Interactive Video Hover & Modal Player

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

    checkStatsVisibility();
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

  // 4. Animated Stats Counter
  let statsAnimated = false;
  const statsSection = document.querySelector('.stats-bar');
  const statNumbers = document.querySelectorAll('.stat-number');

  function checkStatsVisibility() {
    if (!statsSection || statsAnimated) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight - 80) {
      statsAnimated = true;
      statNumbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target') || num.innerText, 10);
        const suffix = num.getAttribute('data-suffix') || '';
        let count = 0;
        const speed = target / 35;

        const updateCount = () => {
          count += speed;
          if (count < target) {
            num.innerText = Math.ceil(count) + suffix;
            setTimeout(updateCount, 30);
          } else {
            num.innerText = target + suffix;
          }
        };
        updateCount();
      });
    }
  }

  // 5. Portfolio Category Filter
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

  // 6. Hover Auto-play Only Hovered Video & Pause All Others
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
      // Hover Mouse Enter -> Play ONLY this video
      card.addEventListener('mouseenter', () => {
        stopAllVideos(); // Pause all other videos
        card.classList.add('playing');
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
        });
      });

      // Mouse Leave -> Stop video
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('playing');
      });
    }

    // Click Card -> Open Enlarged Video Modal
    card.addEventListener('click', () => {
      stopAllVideos(); // Pause grid videos

      const title = card.querySelector('h3')?.innerText || 'Portfolio Video Preview';
      const desc = card.querySelector('p')?.innerText || '';
      const category = card.getAttribute('data-category') || 'Video Editing';
      const videoSrc = video?.getAttribute('src') || card.getAttribute('data-video-src');

      openModal(title, category, desc, videoSrc);
    });
  });

  // 7. Modal Enlarge Video Player Logic
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

  // 8. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // 9. Copy to Clipboard Button & Toast Notification
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

  // 10. Contact Form Submit Handler
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
