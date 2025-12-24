document.addEventListener('DOMContentLoaded', () => {
  // ===========================================
  // NAVBAR FUNCTIONALITY
  // ===========================================
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  $navbarBurgers.forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

      if ($target.classList.contains('is-active')) {
        const menuHeight = $target.offsetHeight;
        const totalHeight = `calc(3.25rem + ${menuHeight}px)`;
        document.body.style.paddingTop = totalHeight;
      } else {
        document.body.style.paddingTop = '3.25rem';
      }
    });
  });

  const navbarMenu = document.getElementById('navbarMenu');
  const navbarLinks = document.querySelectorAll('#navbarMenu .navbar-item');

  navbarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (navbarMenu.classList.contains('is-active')) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const navbarHeight = document.querySelector('.navbar').offsetHeight;
          const targetOffsetTop = targetSection.offsetTop;

          navbarMenu.classList.remove('is-active');
          const burger = document.querySelector('.navbar-burger');
          if (burger) {
            burger.classList.remove('is-active');
          }

          document.body.style.paddingTop = '3.25rem';

          window.scrollTo({
            top: targetOffsetTop - navbarHeight,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ===========================================
  // SERVICE CARDS ANIMATION
  // ===========================================
  const cards = document.querySelectorAll('#services .card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1
    }
  );

  cards.forEach(card => {
    observer.observe(card);
  });

  // ===========================================
  // 3D REVIEW CAROUSEL (UNCHANGED)
  // ===========================================
  const initReviewCarousel = () => {
    const carousel = document.querySelector('.carousel');
    const reviewCards = document.querySelectorAll('.carousel-card');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (!carousel || reviewCards.length === 0) return;

    const totalCards = reviewCards.length;
    const theta = 360 / totalCards;
    const mobileBreakpoint = 650;

    let currentRotation = 0;
    let targetRotation = 0;
    let rotationVelocity = 0;
    let isAutoRotating = true;
    let isUserInteracting = false;
    let pauseTimeout = null;
    let mobileCurrentIndex = 0;

    const autoRotationSpeed = 0.05;
    const friction = 0.95;
    const snapStrength = 0.05;

    const getCardWidth = () => reviewCards[0].offsetWidth;
    const isMobileView = () => window.innerWidth <= mobileBreakpoint;
    const getCardGap = () => {
      if (window.innerWidth <= 800) return 20;
      else if (window.innerWidth <= 1000) return 25;
      return 30;
    };

    const getRadius = () => {
      if (isMobileView()) return 0;
      const cardWidth = getCardWidth();
      const cardGap = getCardGap();
      const baseRadius = Math.round((cardWidth / 2) / Math.tan(Math.PI / totalCards));
      const gapAdjustment = cardGap / (2 * Math.sin(Math.PI / totalCards));
      return Math.round(baseRadius + gapAdjustment);
    };

    reviewCards.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.setAttribute('aria-label', `Go to review ${index + 1}`);
      if (index === 0) indicator.classList.add('is-active');
      indicator.addEventListener('click', () => snapToSlide(index));
      indicatorsContainer.appendChild(indicator);
    });

    const indicators = document.querySelectorAll('.carousel-indicator');

    const positionCards = () => {
      if (isMobileView()) {
        carousel.style.transform = 'none';
        reviewCards.forEach(card => {
          card.style.transform = 'none';
        });
        return;
      }

      const radius = getRadius();
      reviewCards.forEach((card, index) => {
        const angle = theta * index;
        card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      });
    };

    const getCurrentIndex = () => {
      if (isMobileView()) {
        return mobileCurrentIndex;
      }
      const normalizedRotation = ((-currentRotation % 360) + 360) % 360;
      const index = Math.round(normalizedRotation / theta) % totalCards;
      return index;
    };

    const updateActiveStates = () => {
      const currentIndex = getCurrentIndex();

      reviewCards.forEach((card, index) => {
        card.classList.toggle('is-active', index === currentIndex);
      });

      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('is-active', index === currentIndex);
      });
    };

    const snapToSlide = (targetIndex) => {
      if (isMobileView()) {
        mobileCurrentIndex = targetIndex;
        updateActiveStates();
        return;
      }

      isAutoRotating = false;
      rotationVelocity = 0;

      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
        pauseTimeout = null;
      }

      const desiredRotation = -targetIndex * theta;
      const currentNormalized = currentRotation % 360;
      const desiredNormalized = desiredRotation % 360;

      let diff = desiredNormalized - currentNormalized;
      if (diff > 180) {
        diff -= 360;
      } else if (diff < -180) {
        diff += 360;
      }

      targetRotation = currentRotation + diff;
    };

    const animate = () => {
      if (isMobileView()) {
        carousel.style.transform = 'none';
        updateActiveStates();
        requestAnimationFrame(animate);
        return;
      }

      if (isAutoRotating && !isUserInteracting) {
        currentRotation -= autoRotationSpeed;
      }

      if (!isAutoRotating && Math.abs(targetRotation - currentRotation) > 0.1) {
        currentRotation += (targetRotation - currentRotation) * snapStrength;
      } else if (!isAutoRotating && Math.abs(targetRotation - currentRotation) <= 0.1) {
        currentRotation = targetRotation;
        if (!pauseTimeout) {
          pauseTimeout = setTimeout(() => {
            if (!isUserInteracting) {
              isAutoRotating = true;
            }
            pauseTimeout = null;
          }, 1000);
        }
      }

      if (Math.abs(rotationVelocity) > 0.01) {
        currentRotation += rotationVelocity;
        rotationVelocity *= friction;
      } else if (!isAutoRotating) {
        rotationVelocity = 0;
      }

      const radius = getRadius();
      carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation}deg)`;

      updateActiveStates();
      requestAnimationFrame(animate);
    };

    prevBtn.addEventListener('click', () => {
      const currentIndex = getCurrentIndex();
      snapToSlide((currentIndex - 1 + totalCards) % totalCards);
    });

    nextBtn.addEventListener('click', () => {
      const currentIndex = getCurrentIndex();
      snapToSlide((currentIndex + 1) % totalCards);
    });

    const carouselScene = document.querySelector('.carousel-scene');
    let touchStartX = 0;
    let touchStartY = 0;

    carouselScene.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    carouselScene.addEventListener('touchmove', (e) => {
      const touchMoveX = e.touches[0].clientX;
      const touchMoveY = e.touches[0].clientY;
      const deltaX = Math.abs(touchMoveX - touchStartX);
      const deltaY = Math.abs(touchMoveY - touchStartY);

      if (deltaX > deltaY) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        const currentIndex = getCurrentIndex();
        snapToSlide((currentIndex + 1) % totalCards);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = getCurrentIndex();
        snapToSlide((currentIndex - 1 + totalCards) % totalCards);
      }
    });

    let resizeTimeout;
    let previousMobileState = isMobileView();

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentMobileState = isMobileView();

        if (previousMobileState !== currentMobileState) {
          if (currentMobileState) {
            mobileCurrentIndex = getCurrentIndex();
            currentRotation = 0;
            targetRotation = 0;
            rotationVelocity = 0;
            isAutoRotating = true;
          } else {
            currentRotation = -mobileCurrentIndex * theta;
            targetRotation = currentRotation;
            rotationVelocity = 0;
            isAutoRotating = true;
          }
          previousMobileState = currentMobileState;
        }

        positionCards();
        updateActiveStates();
      }, 100);
    });

    positionCards();
    animate();
  };

  // ===========================================
  // INFINITE GALLERY CAROUSEL
  // ===========================================
  
  const GALLERY_IMAGES = {
    coupes: [
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg'
    ],
    sedans: [
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp'
    ],
    suvs: [
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg'
    ],
    trucks: [
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg'
    ]
  };

  class GalleryCarousel {
    constructor(container, images) {
      this.container = container;
      this.images = images;
      this.stage = container.querySelector('.gallery-stage');
      this.cardsRoot = container.querySelector('.gallery-cards');
      this.prevBtn = container.querySelector('.gallery-nav-prev');
      this.nextBtn = container.querySelector('.gallery-nav-next');
      
      this.FRICTION = 0.9;
      this.WHEEL_SENS = 0.6;
      this.DRAG_SENS = 1.0;
      this.SNAP_THRESHOLD = 0.5;
      this.SNAP_DURATION = 400;
      
      this.MAX_ROTATION = 28;
      this.MAX_DEPTH = 140;
      this.MIN_SCALE = 0.92;
      this.SCALE_RANGE = 0.1;
      this.GAP = 28;
      
      this.items = [];
      this.positions = [];
      this.activeIndex = -1;
      this.CARD_W = 300;
      this.CARD_H = 400;
      this.STEP = this.CARD_W + this.GAP;
      this.TRACK = 0;
      this.SCROLL_X = 0;
      this.VW_HALF = window.innerWidth * 0.5;
      this.vX = 0;
      this.rafId = null;
      this.lastTime = 0;
      this.isActive = false;
      this.isInitialized = false;
      
      this.clickStartX = 0;
      this.clickStartY = 0;
      this.clickStartTime = 0;
      
      this.isSnapping = false;
      this.snapStartTime = 0;
      this.snapStartScroll = 0;
      this.snapTargetScroll = 0;
      
      this.tick = this.tick.bind(this);
      this.onWheel = this.onWheel.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onResize = this.onResize.bind(this);
    }
    
    mod(n, m) {
      return ((n % m) + m) % m;
    }
    
    createCards() {
      this.cardsRoot.innerHTML = '';
      this.items = [];
      
      const fragment = document.createDocumentFragment();
      
      this.images.forEach((src, i) => {
        const card = document.createElement('article');
        card.className = 'gallery-card';
        card.style.willChange = 'transform';
        card.style.cursor = 'pointer';
        card.dataset.index = i;

        const img = new Image();
        img.className = 'gallery-card__img';
        img.decoding = 'async';
        img.loading = 'eager';
        img.draggable = false;
        img.src = src;
        img.alt = `Gallery image ${i + 1}`;

        card.appendChild(img);
        fragment.appendChild(card);
        this.items.push({ el: card, x: i * this.STEP });
      });
      
      this.cardsRoot.appendChild(fragment);
    }
    
    measure() {
      const sample = this.items[0]?.el;
      if (!sample) return;
      
      const r = sample.getBoundingClientRect();
      this.CARD_W = r.width || this.CARD_W;
      this.CARD_H = r.height || this.CARD_H;
      this.STEP = this.CARD_W + this.GAP;
      this.TRACK = this.items.length * this.STEP;
      
      this.items.forEach((it, i) => {
        it.x = i * this.STEP;
      });
      
      this.positions = new Float32Array(this.items.length);
    }
    
    computeTransformComponents(screenX) {
      const norm = Math.max(-1, Math.min(1, screenX / this.VW_HALF));
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;
      
      const ry = -norm * this.MAX_ROTATION;
      const tz = invNorm * this.MAX_DEPTH;
      const scale = this.MIN_SCALE + invNorm * this.SCALE_RANGE;
      
      return { norm, absNorm, invNorm, ry, tz, scale };
    }
    
    transformForScreenX(screenX) {
      const { ry, tz, scale } = this.computeTransformComponents(screenX);
      const offsetX = screenX - (this.CARD_W / 2);

      return {
        transform: `translate3d(${offsetX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz
      };
    }
    
    updateTransforms() {
      const half = this.TRACK / 2;
      let closestIdx = -1;
      let closestDist = Infinity;
      
      for (let i = 0; i < this.items.length; i++) {
        let pos = this.items[i].x - this.SCROLL_X;
        
        if (pos < -half) pos += this.TRACK;
        if (pos > half) pos -= this.TRACK;
        
        this.positions[i] = pos;
        
        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
      
      const prevIdx = (closestIdx - 1 + this.items.length) % this.items.length;
      const nextIdx = (closestIdx + 1) % this.items.length;
      
      for (let i = 0; i < this.items.length; i++) {
        const it = this.items[i];
        const pos = this.positions[i];
        const norm = Math.max(-1, Math.min(1, pos / this.VW_HALF));
        const { transform, z } = this.transformForScreenX(pos);
        
        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z));
        
        let blur = 0;
        if (i === closestIdx) {
          blur = 0;
        } else if (i === prevIdx || i === nextIdx) {
          blur = 1 * Math.pow(Math.abs(norm), 1.1);
        } else {
          blur = 2 * Math.pow(Math.abs(norm), 1.1);
        }
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
        
        it.el.classList.toggle('is-active', i === closestIdx);
      }
      
      this.activeIndex = closestIdx;
    }
    
    snapToClosest() {
      if (this.isSnapping) return;
      
      const targetIndex = this.activeIndex;
      const targetScrollX = this.items[targetIndex].x;
      
      let diff = targetScrollX - this.SCROLL_X;
      const halfTrack = this.TRACK / 2;
      
      if (diff > halfTrack) {
        diff -= this.TRACK;
      } else if (diff < -halfTrack) {
        diff += this.TRACK;
      }
      
      if (Math.abs(diff) < 1) {
        this.SCROLL_X = targetScrollX;
        return;
      }
      
      this.isSnapping = true;
      this.snapStartTime = performance.now();
      this.snapStartScroll = this.SCROLL_X;
      this.snapTargetScroll = this.mod(this.SCROLL_X + diff, this.TRACK);
      this.vX = 0;
    }
    
    snapToCard(targetIndex) {
      if (this.isSnapping) return;
      
      const targetScrollX = this.items[targetIndex].x;
      
      let diff = targetScrollX - this.SCROLL_X;
      const halfTrack = this.TRACK / 2;
      
      if (diff > halfTrack) {
        diff -= this.TRACK;
      } else if (diff < -halfTrack) {
        diff += this.TRACK;
      }
      
      this.isSnapping = true;
      this.snapStartTime = performance.now();
      this.snapStartScroll = this.SCROLL_X;
      this.snapTargetScroll = this.mod(this.SCROLL_X + diff, this.TRACK);
      this.vX = 0;
    }
    
    tick(t) {
      if (!this.isActive) return;
      
      const dt = this.lastTime ? (t - this.lastTime) / 1000 : 0;
      this.lastTime = t;
      
      if (this.isSnapping) {
        const elapsed = performance.now() - this.snapStartTime;
        const progress = Math.min(elapsed / this.SNAP_DURATION, 1);
        
        const eased = 1 - Math.pow(1 - progress, 3);
        
        let diff = this.snapTargetScroll - this.snapStartScroll;
        const halfTrack = this.TRACK / 2;
        
        if (diff > halfTrack) {
          diff -= this.TRACK;
        } else if (diff < -halfTrack) {
          diff += this.TRACK;
        }
        
        this.SCROLL_X = this.mod(this.snapStartScroll + diff * eased, this.TRACK);
        
        if (progress >= 1) {
          this.SCROLL_X = this.snapTargetScroll;
          this.isSnapping = false;
        }
      } else {
        this.SCROLL_X = this.mod(this.SCROLL_X + this.vX * dt, this.TRACK);
        
        const decay = Math.pow(this.FRICTION, dt * 60);
        this.vX *= decay;
        
        // Trigger snap when velocity gets low enough
        if (Math.abs(this.vX) < this.SNAP_THRESHOLD) {
          this.vX = 0;
          this.snapToClosest();
        }
      }
      
      this.updateTransforms();
      this.rafId = requestAnimationFrame(this.tick);
    }
    
    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.lastTime = 0;
      this.rafId = requestAnimationFrame((t) => {
        this.updateTransforms();
        this.tick(t);
      });
      this.addEventListeners();
    }
    
    stop() {
      this.isActive = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.removeEventListeners();
    }
    
    onWheel(e) {
      e.preventDefault();
      this.isSnapping = false;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      this.vX += delta * this.WHEEL_SENS * 20;
    }
    
    onPointerDown(e) {
      // Only used to detect clicks now
      if (e.target.closest('.gallery-nav-btn')) return;
      
      this.clickStartX = e.clientX;
      this.clickStartY = e.clientY;
      this.clickStartTime = Date.now();
    }
    
    onPointerUp(e) {
      // Simple click detection
      const duration = Date.now() - this.clickStartTime;
      const distX = Math.abs(e.clientX - this.clickStartX);
      const distY = Math.abs(e.clientY - this.clickStartY);
      
      // It's a click if quick and didn't move
      const isClick = duration < 300 && distX < 10 && distY < 10;
      
      if (isClick) {
        const clickedCard = e.target.closest('.gallery-card');
        if (clickedCard) {
          const clickedIndex = parseInt(clickedCard.dataset.index);
          if (!isNaN(clickedIndex)) {
            if (clickedIndex === this.activeIndex) {
              // Center card - open fullscreen
              const img = clickedCard.querySelector('img');
              if (img && img.src) {
                this.openFullscreen(img.src, img.alt || '');
              }
            } else {
              // Side card - navigate to it
              this.snapToCard(clickedIndex);
            }
          }
        }
      }
    }
    
    onResize() {
      const prevStep = this.STEP || 1;
      const ratio = this.SCROLL_X / (this.items.length * prevStep);
      this.measure();
      this.VW_HALF = window.innerWidth * 0.5;
      this.SCROLL_X = this.mod(ratio * this.TRACK, this.TRACK);
      if (this.isActive) {
        this.updateTransforms();
      }
    }
    
    onCardClick(e) {
      // Don't process click if user was dragging
      if (this.hasDragged) {
        return;
      }

      const clickedCard = e.target.closest('.gallery-card');
      if (!clickedCard) return;

      const clickedIndex = parseInt(clickedCard.dataset.index);
      if (isNaN(clickedIndex)) return;

      // Center card - open fullscreen
      if (clickedIndex === this.activeIndex) {
        e.preventDefault();
        e.stopPropagation();
        const img = clickedCard.querySelector('img');
        if (img && img.src) {
          this.openFullscreen(img.src, img.alt || '');
        }
      } else {
        // Side card - navigate to it
        e.preventDefault();
        this.snapToCard(clickedIndex);
      }
    }
    
    addEventListeners() {
      this.stage.addEventListener('wheel', this.onWheel, { passive: false });
      this.stage.addEventListener('pointerdown', this.onPointerDown);
      this.stage.addEventListener('pointerup', this.onPointerUp);
      this.stage.addEventListener('dragstart', (e) => e.preventDefault());

      this.prevBtn.addEventListener('click', () => this.navigatePrev());
      this.nextBtn.addEventListener('click', () => this.navigateNext());
    }
    
    removeEventListeners() {
      this.stage.removeEventListener('wheel', this.onWheel);
      this.stage.removeEventListener('pointerdown', this.onPointerDown);
      this.stage.removeEventListener('pointerup', this.onPointerUp);
    }
    
    navigatePrev() {
      const targetIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
      this.snapToCard(targetIndex);
    }

    navigateNext() {
      const targetIndex = (this.activeIndex + 1) % this.items.length;
      this.snapToCard(targetIndex);
    }

    async openFullscreen(imgSrc, imgAlt) {
      const overlay = document.createElement('div');
      overlay.className = 'gallery-fullscreen-overlay';
      overlay.innerHTML = `
        <div class="gallery-fullscreen-content">
          <button class="gallery-fullscreen-close" aria-label="Close fullscreen">
            <span>&times;</span>
          </button>
          <img src="${imgSrc}" alt="${imgAlt}" class="gallery-fullscreen-image">
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      // Request native fullscreen on mobile/tablet
      try {
        if (overlay.requestFullscreen) {
          await overlay.requestFullscreen();
        } else if (overlay.webkitRequestFullscreen) {
          await overlay.webkitRequestFullscreen();
        } else if (overlay.msRequestFullscreen) {
          await overlay.msRequestFullscreen();
        }
      } catch (error) {
        // Fullscreen not available, lightbox still works
        console.log('Fullscreen not available');
      }

      // Close lightbox function
      const closeFullscreen = async () => {
        // Exit fullscreen if active
        try {
          if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
              await document.msExitFullscreen();
            }
          }
        } catch (error) {
          console.log('Exit fullscreen error');
        }

        overlay.classList.add('closing');
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 300);
      };

      // Close button
      overlay.querySelector('.gallery-fullscreen-close').addEventListener('click', closeFullscreen);

      // Click outside image
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeFullscreen();
        }
      });

      // ESC key
      const handleEsc = (e) => {
        if (e.key === 'Escape' && overlay.parentNode) {
          closeFullscreen();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);

      // Handle fullscreen change (user exits fullscreen via device button)
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
          if (overlay.parentNode) {
            closeFullscreen();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
          }
        }
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);

      // Fade in animation
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    }
    
    async init() {
      if (this.isInitialized) return;
      
      this.createCards();
      await this.waitForImages();
      this.measure();
      this.updateTransforms();
      this.isInitialized = true;
      
      if (window.gsap) {
        await this.animateEntry();
      }
    }
    
    waitForImages() {
      const promises = this.items.map((it) => {
        const img = it.el.querySelector('img');
        if (!img || img.complete) return Promise.resolve();
        
        return new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      });
      
      return Promise.all(promises);
    }
    
    async animateEntry() {
      const half = this.TRACK / 2;
      const viewportWidth = window.innerWidth;
      const visibleCards = [];
      
      for (let i = 0; i < this.items.length; i++) {
        let pos = this.items[i].x - this.SCROLL_X;
        if (pos < -half) pos += this.TRACK;
        if (pos > half) pos -= this.TRACK;
        
        if (Math.abs(pos) < viewportWidth * 0.7) {
          visibleCards.push({ item: this.items[i], screenX: pos, index: i });
        }
      }
      
      visibleCards.sort((a, b) => a.screenX - b.screenX);
      
      const tl = window.gsap.timeline();
      
      visibleCards.forEach(({ item, screenX }, idx) => {
        const state = { p: 0 };
        const { ry, tz, scale: baseScale } = this.computeTransformComponents(screenX);
        const offsetX = screenX - (this.CARD_W / 2);
        const START_SCALE = 0.85;
        const START_Y = 60;

        item.el.style.opacity = '0';
        item.el.style.transform =
          `translate3d(${offsetX}px,-50%,${tz}px) ` +
          `rotateY(${ry}deg) ` +
          `scale(${START_SCALE}) ` +
          `translateY(${START_Y}px)`;

        tl.to(
          state,
          {
            p: 1,
            duration: 0.5,
            ease: 'power3.out',
            onUpdate: () => {
              const t = state.p;
              const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
              const currentY = START_Y * (1 - t);

              item.el.style.opacity = t.toFixed(3);

              if (t >= 0.999) {
                const { transform } = this.transformForScreenX(screenX);
                item.el.style.transform = transform;
              } else {
                item.el.style.transform =
                  `translate3d(${offsetX}px,-50%,${tz}px) ` +
                  `rotateY(${ry}deg) ` +
                  `scale(${currentScale}) ` +
                  `translateY(${currentY}px)`;
              }
            }
          },
          idx * 0.08
        );
      });
      
      return new Promise((resolve) => {
        tl.eventCallback('onComplete', resolve);
      });
    }
  }
  
  // ===========================================
  // INFINITE GALLERY CAROUSEL - STACKED IMAGES
  // ===========================================
  
  const initGalleryCarousel = () => {
    const galleryCarousel = document.getElementById('galleryCarousel');
    
    if (!galleryCarousel) return;
    
    const carouselItems = galleryCarousel.querySelectorAll('.carousel-item');
    const totalItems = carouselItems.length;
    
    if (totalItems === 0) return;
    
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let animationFrameId = null;
    
    // Clone items for infinite scroll
    const firstClone = carouselItems[0].cloneNode(true);
    const lastClone = carouselItems[totalItems - 1].cloneNode(true);
    
    galleryCarousel.appendChild(firstClone);
    galleryCarousel.insertBefore(lastClone, carouselItems[0]);
    
    // Position to first real item
    const scrollToIndex = (index, smooth = false) => {
      const itemWidth = carouselItems[0].offsetWidth;
      const gap = 30; // Match your carousel gap
      const scrollPosition = (index + 1) * (itemWidth + gap);
      
      galleryCarousel.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };
    
    // Initialize position
    scrollToIndex(0, false);
    
    // Auto-scroll functionality
    let autoScrollInterval;
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!isDragging) {
          currentIndex = (currentIndex + 1) % totalItems;
          scrollToIndex(currentIndex, true);
        }
      }, 3000);
    };
    
    const stopAutoScroll = () => {
      clearInterval(autoScrollInterval);
    };
    
    // Handle infinite loop
    const handleInfiniteScroll = () => {
      const itemWidth = carouselItems[0].offsetWidth;
      const gap = 30;
      const scrollPosition = galleryCarousel.scrollLeft;
      const itemSize = itemWidth + gap;
      
      // Check if we're at the cloned first item
      if (scrollPosition >= itemSize * (totalItems + 1)) {
        galleryCarousel.scrollLeft = itemSize;
        currentIndex = 0;
      }
      
      // Check if we're at the cloned last item
      if (scrollPosition <= 0) {
        galleryCarousel.scrollLeft = itemSize * totalItems;
        currentIndex = totalItems - 1;
      }
    };
    
    // Scroll event listener
    galleryCarousel.addEventListener('scroll', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(handleInfiniteScroll);
    });
    
    // Mouse/Touch drag functionality
    const handleDragStart = (e) => {
      isDragging = true;
      stopAutoScroll();
      startX = e.pageX || e.touches[0].pageX;
      scrollLeft = galleryCarousel.scrollLeft;
      galleryCarousel.style.cursor = 'grabbing';
    };
    
    const handleDragMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX || e.touches[0].pageX;
      const walk = (x - startX) * 2;
      galleryCarousel.scrollLeft = scrollLeft - walk;
    };
    
    const handleDragEnd = () => {
      isDragging = false;
      galleryCarousel.style.cursor = 'grab';
      
      // Snap to nearest item
      const itemWidth = carouselItems[0].offsetWidth;
      const gap = 30;
      const itemSize = itemWidth + gap;
      const snapIndex = Math.round(galleryCarousel.scrollLeft / itemSize);
      
      galleryCarousel.scrollTo({
        left: snapIndex * itemSize,
        behavior: 'smooth'
      });
      
      setTimeout(startAutoScroll, 500);
    };
    
    // Event listeners for drag
    galleryCarousel.addEventListener('mousedown', handleDragStart);
    galleryCarousel.addEventListener('touchstart', handleDragStart);
    
    galleryCarousel.addEventListener('mousemove', handleDragMove);
    galleryCarousel.addEventListener('touchmove', handleDragMove);
    
    galleryCarousel.addEventListener('mouseup', handleDragEnd);
    galleryCarousel.addEventListener('mouseleave', handleDragEnd);
    galleryCarousel.addEventListener('touchend', handleDragEnd);
    
    // Fullscreen Lightbox functionality
    const lightbox = document.getElementById('fullscreenLightbox');
    const lightboxImage = document.getElementById('fullscreenImage');
    const closeBtn = lightbox.querySelector('.fullscreen-close');
    const prevBtn = lightbox.querySelector('.fullscreen-prev');
    const nextBtn = lightbox.querySelector('.fullscreen-next');
    
    let allGalleryImages = [];
    let currentLightboxIndex = 0;
    
    // Collect all images from the carousel
    const collectAllImages = () => {
      allGalleryImages = [];
      const items = galleryCarousel.querySelectorAll('.gallery-stacked-item');
      
      items.forEach(item => {
        const exteriorImg = item.querySelector('.gallery-exterior');
        const interiorImg = item.querySelector('.gallery-interior');
        
        if (exteriorImg) allGalleryImages.push(exteriorImg.src);
        if (interiorImg) allGalleryImages.push(interiorImg.src);
      });
    };
    
    collectAllImages();
    
    const openLightbox = (imageSrc) => {
      currentLightboxIndex = allGalleryImages.indexOf(imageSrc);
      if (currentLightboxIndex === -1) currentLightboxIndex = 0;
      
      lightboxImage.src = allGalleryImages[currentLightboxIndex];
      lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      stopAutoScroll();
    };
    
    const closeLightbox = () => {
      lightbox.classList.remove('is-active');
      document.body.style.overflow = '';
      startAutoScroll();
    };
    
    const showNextImage = () => {
      currentLightboxIndex = (currentLightboxIndex + 1) % allGalleryImages.length;
      lightboxImage.src = allGalleryImages[currentLightboxIndex];
    };
    
    const showPrevImage = () => {
      currentLightboxIndex = (currentLightboxIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
      lightboxImage.src = allGalleryImages[currentLightboxIndex];
    };
    
    // Add click listeners to all images (both exterior and interior)
    const allImages = galleryCarousel.querySelectorAll('.gallery-exterior, .gallery-interior');
    allImages.forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(img.src);
      });
    });
    
    // Button event listeners
    closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
    if (nextBtn) nextBtn.addEventListener('click', showNextImage);
    
    // ESC key to close lightbox
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-active')) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      }
    });
    
    // Swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 50) { // Minimum swipe distance
          if (deltaX > 0) {
            showPrevImage();
          } else {
            showNextImage();
          }
        }
      }
    };
    
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });
    
    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });
    
    // Start auto-scroll
    startAutoScroll();
    
    // Pause auto-scroll when carousel is not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAutoScroll();
        } else {
          stopAutoScroll();
        }
      });
    });
    
    observer.observe(galleryCarousel);
  };

  // ===========================================
  // INITIALIZATION
  // ===========================================
  
  initReviewCarousel();
  initGalleryCarousel();
});