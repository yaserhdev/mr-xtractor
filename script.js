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
  // GALLERY CAROUSEL (Based on Review Carousel)
  // ===========================================
  
  const GALLERY_IMAGES = {
    coupes: [
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
      './gtr.jpeg',
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
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
      './charger.webp',
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
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
      './urus.jpg',
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
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg',
      './trx.jpg'
    ]
  };

  const initGalleryCarousel = (container, images) => {
    const carousel = container.querySelector('.gallery-carousel');
    const prevBtn = container.querySelector('.gallery-carousel-btn-prev');
    const nextBtn = container.querySelector('.gallery-carousel-btn-next');
    const indicatorsContainer = container.querySelector('.gallery-carousel-indicators');

    if (!carousel || images.length === 0) return;

    const totalCards = images.length;
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

    // Create gallery cards
    images.forEach((imageSrc, index) => {
      const card = document.createElement('div');
      card.classList.add('gallery-carousel-card');
      if (index === 0) card.classList.add('is-active');

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = `Gallery image ${index + 1}`;
      img.draggable = false;

      card.appendChild(img);
      carousel.appendChild(card);

      // Add click event for fullscreen
      card.addEventListener('click', () => {
        if (!card.classList.contains('is-active')) {
          snapToSlide(index);
        } else {
          openFullscreen(imageSrc);
        }
      });
    });

    const galleryCards = carousel.querySelectorAll('.gallery-carousel-card');

    const getCardWidth = () => galleryCards[0].offsetWidth;
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

    // Create indicators
    galleryCards.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.classList.add('gallery-carousel-indicator');
      indicator.setAttribute('aria-label', `Go to image ${index + 1}`);
      if (index === 0) indicator.classList.add('is-active');
      indicator.addEventListener('click', () => snapToSlide(index));
      indicatorsContainer.appendChild(indicator);
    });

    const indicators = container.querySelectorAll('.gallery-carousel-indicator');

    const positionCards = () => {
      if (isMobileView()) {
        carousel.style.transform = 'none';
        galleryCards.forEach(card => {
          card.style.transform = 'none';
        });
        return;
      }

      const radius = getRadius();
      galleryCards.forEach((card, index) => {
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

      galleryCards.forEach((card, index) => {
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

    const carouselScene = container.querySelector('.gallery-carousel-scene');
    let touchStartX = 0;
    let touchStartY = 0;

    carouselScene.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isUserInteracting = true;
      isAutoRotating = false;

      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
        pauseTimeout = null;
      }
    });

    carouselScene.addEventListener('touchmove', (e) => {
      if (!isUserInteracting) return;

      const touchDeltaX = e.touches[0].clientX - touchStartX;
      const touchDeltaY = e.touches[0].clientY - touchStartY;

      if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
        e.preventDefault();
      }
    }, { passive: false });

    carouselScene.addEventListener('touchend', (e) => {
      if (!isUserInteracting) return;

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) > 50) {
        const currentIndex = getCurrentIndex();
        if (deltaX > 0) {
          snapToSlide((currentIndex - 1 + totalCards) % totalCards);
        } else {
          snapToSlide((currentIndex + 1) % totalCards);
        }
      }

      setTimeout(() => {
        isUserInteracting = false;
        if (!pauseTimeout) {
          pauseTimeout = setTimeout(() => {
            isAutoRotating = true;
            pauseTimeout = null;
          }, 1000);
        }
      }, 100);
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

    // Fullscreen image viewer
    function openFullscreen(imageSrc) {
      const overlay = document.createElement('div');
      overlay.className = 'gallery-fullscreen-overlay';

      overlay.innerHTML = `
        <button class="gallery-fullscreen-close" aria-label="Close fullscreen">✕</button>
        <img src="${imageSrc}" alt="Fullscreen image">
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const closeFullscreen = () => {
        overlay.classList.add('closing');
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 300);
      };

      overlay.querySelector('.gallery-fullscreen-close').addEventListener('click', closeFullscreen);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeFullscreen();
        }
      });

      const handleEsc = (e) => {
        if (e.key === 'Escape' && overlay.parentNode) {
          closeFullscreen();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);

      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    }

    positionCards();
    animate();
  };
  
  // ===========================================
  // GALLERY TAB MANAGEMENT
  // ===========================================
  
  const tabs = document.querySelectorAll('#gallery .tabs li');
  const categoryContainers = {
    'coupes': document.querySelector('.gallery-carousel-container.coupes'),
    'sedans': document.querySelector('.gallery-carousel-container.sedans'),
    'suvs': document.querySelector('.gallery-carousel-container.suvs'),
    'trucks': document.querySelector('.gallery-carousel-container.trucks')
  };

  // Initialize the first carousel (coupes) on load
  if (categoryContainers['coupes']) {
    initGalleryCarousel(categoryContainers['coupes'], GALLERY_IMAGES['coupes']);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const categoryName = tab.dataset.category;

      Object.values(categoryContainers).forEach(container => {
        if (container) container.classList.add('is-hidden');
      });

      if (categoryContainers[categoryName]) {
        categoryContainers[categoryName].classList.remove('is-hidden');
        
        // Initialize carousel if it hasn't been initialized yet
        const carousel = categoryContainers[categoryName].querySelector('.gallery-carousel');
        if (carousel && carousel.children.length === 0) {
          initGalleryCarousel(categoryContainers[categoryName], GALLERY_IMAGES[categoryName]);
        }
      }
    });
  });

  // ===========================================
  // INITIALIZATION
  // ===========================================
  
  initReviewCarousel();
});