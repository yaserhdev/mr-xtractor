document.addEventListener('DOMContentLoaded', () => {
  // ===========================================
  // SMOOTH SCROLL WITH CUSTOM SPEED
  // ===========================================
  
  // Helper function for smooth scrolling with configurable speed
  function smoothScrollTo(targetSection, duration) {
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = targetSection.offsetTop - navbarHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let start = null;
    
    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Ease in-out quad for smoother motion
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    requestAnimationFrame(animation);
  }
  
  // Navbar links get faster scroll (800ms)
  document.querySelectorAll('.navbar-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      
      e.preventDefault();
      this.blur(); // Remove focus to prevent highlight
      smoothScrollTo(targetSection, 800); // Fast scroll for navbar
    });
  });
  
  // All other anchor links get slower scroll (1600ms)
  document.querySelectorAll('a[href^="#"]:not(.navbar-menu a)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      
      e.preventDefault();
      smoothScrollTo(targetSection, 1600); // Slower scroll for other links
    });
  });
  
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

          link.blur(); // Remove focus to prevent highlight

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
  const serviceColumns = document.querySelectorAll('#services .column');
  const servicesSection = document.querySelector('#services');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add visible class to all columns when section comes into view
          // CSS stagger delays will make them appear one at a time
          serviceColumns.forEach(column => {
            column.classList.add('is-visible');
          });
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px'
    }
  );

  // Observe the services section
  if (servicesSection) {
    observer.observe(servicesSection);
  }

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

    const autoRotationSpeed = 0.06;
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
  
  // Each card contains a pair of images [top, bottom] - 14 pairs total (28 images)
  const GALLERY_IMAGES = [
    ['./assets/13A.webp', './assets/13B.webp'],
    ['./assets/0A.webp', './assets/0B.webp'],
    ['./assets/1A.webp', './assets/1B.webp'],
    ['./assets/2A.webp', './assets/2B.webp'],
    ['./assets/3A.webp', './assets/3B.webp'],
    ['./assets/4A.webp', './assets/4B.webp'],
    ['./assets/5A.webp', './assets/5B.webp'],
    ['./assets/6A.webp', './assets/6B.webp'],
    ['./assets/7A.webp', './assets/7B.webp'],
    ['./assets/8A.webp', './assets/8B.webp'],
    ['./assets/9A.webp', './assets/9B.webp'],
    ['./assets/10A.webp', './assets/10B.webp'],
    ['./assets/11A.webp', './assets/11B.webp'],
    ['./assets/12A.webp', './assets/12B.webp']
  ];

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

    // Create gallery cards with stacked images
    images.forEach((imagePair, index) => {
      const card = document.createElement('div');
      card.classList.add('gallery-carousel-card');
      if (index === 0) card.classList.add('is-active');

      // Create container for stacked images
      const stackContainer = document.createElement('div');
      stackContainer.classList.add('image-stack');

      // Create top image (staggered to the right)
      const imgTop = document.createElement('img');
      imgTop.src = imagePair[0];
      imgTop.alt = `Gallery image ${index * 2 + 1}`;
      imgTop.draggable = false;
      imgTop.classList.add('stack-image', 'stack-top');

      // Create bottom image (staggered to the bottom-right)
      const imgBottom = document.createElement('img');
      imgBottom.src = imagePair[1];
      imgBottom.alt = `Gallery image ${index * 2 + 2}`;
      imgBottom.draggable = false;
      imgBottom.classList.add('stack-image', 'stack-bottom');

      stackContainer.appendChild(imgTop);
      stackContainer.appendChild(imgBottom);
      card.appendChild(stackContainer);
      carousel.appendChild(card);

      // Add click events for each image
      imgTop.addEventListener('click', (e) => {
        e.stopPropagation();
        if (card.classList.contains('is-active')) {
          openFullscreen(imagePair[0]);
        } else {
          snapToSlide(index);
        }
      });

      imgBottom.addEventListener('click', (e) => {
        e.stopPropagation();
        if (card.classList.contains('is-active')) {
          openFullscreen(imagePair[1]);
        } else {
          snapToSlide(index);
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

    // Fullscreen image viewer with navigation
    function openFullscreen(imageSrc) {
      // Flatten all images into a single array for navigation
      const allImages = images.flatMap(pair => [pair[0], pair[1]]);
      let currentIndex = allImages.indexOf(imageSrc);
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-fullscreen-overlay';

      overlay.innerHTML = `
        <button class="gallery-fullscreen-close" aria-label="Close fullscreen">✕</button>
        <button class="gallery-fullscreen-nav gallery-fullscreen-prev" aria-label="Previous image">
          <span>‹</span>
        </button>
        <button class="gallery-fullscreen-nav gallery-fullscreen-next" aria-label="Next image">
          <span>›</span>
        </button>
        <div class="gallery-fullscreen-content">
          <img class="gallery-fullscreen-image" src="${imageSrc}" alt="Fullscreen image">
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const imgElement = overlay.querySelector('.gallery-fullscreen-image');
      const prevBtn = overlay.querySelector('.gallery-fullscreen-prev');
      const nextBtn = overlay.querySelector('.gallery-fullscreen-next');

      const updateImage = (newIndex) => {
        currentIndex = newIndex;
        imgElement.style.opacity = '0';
        setTimeout(() => {
          imgElement.src = allImages[currentIndex];
          imgElement.style.opacity = '1';
        }, 150);
      };

      const showPrevious = () => {
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        updateImage(newIndex);
      };

      const showNext = () => {
        const newIndex = (currentIndex + 1) % allImages.length;
        updateImage(newIndex);
      };

      const closeFullscreen = () => {
        overlay.classList.add('closing');
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
          document.removeEventListener('keydown', handleKeydown);
        }, 300);
      };

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevious();
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
      });

      overlay.querySelector('.gallery-fullscreen-close').addEventListener('click', closeFullscreen);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeFullscreen();
        }
      });

      const handleKeydown = (e) => {
        if (!overlay.parentNode) return;
        
        if (e.key === 'Escape') {
          closeFullscreen();
        } else if (e.key === 'ArrowLeft') {
          showPrevious();
        } else if (e.key === 'ArrowRight') {
          showNext();
        }
      };
      document.addEventListener('keydown', handleKeydown);

      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    }

    positionCards();
    animate();
  };
  
  // ===========================================
  // GALLERY CAROUSEL INITIALIZATION
  // ===========================================
  
  const galleryContainer = document.querySelector('.gallery-carousel-container');
  if (galleryContainer) {
    initGalleryCarousel(galleryContainer, GALLERY_IMAGES);
  }

  // ===========================================
  // FLOATING CALL BUTTON - DATE/TIME VISIBILITY
  // ===========================================
  
  const floatingCallBtn = document.getElementById('floating-call-btn');
  
  // Configure your phone number here
  const PHONE_NUMBER = '+17036266014'; // Replace with actual phone number
  floatingCallBtn.href = `tel:${PHONE_NUMBER}`;
  
  // Configure availability windows
  // Format: { dayOfWeek: [0-6 where 0=Sunday], startHour: 0-23, endHour: 0-23 }
  const AVAILABILITY_WINDOWS = [
    // Example: Monday-Friday, 9 AM - 5 PM
    { dayOfWeek: 0, startHour: 6, endHour: 21 },  // Sunday
    { dayOfWeek: 1, startHour: 6, endHour: 21 },  // Monday
    { dayOfWeek: 2, startHour: 6, endHour: 21 },  // Tuesday
    { dayOfWeek: 3, startHour: 6, endHour: 21 },  // Wednesday
    { dayOfWeek: 4, startHour: 6, endHour: 21 },  // Thursday
    { dayOfWeek: 5, startHour: 6, endHour: 21 },  // Friday
    { dayOfWeek: 6, startHour: 6, endHour: 21 }   // Saturday
  ];
  
  function checkAvailability() {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentHour = now.getHours(); // 0-23
    
    // Check if current time falls within any availability window
    const isAvailable = AVAILABILITY_WINDOWS.some(window => {
      return window.dayOfWeek === currentDay && 
             currentHour >= window.startHour && 
             currentHour < window.endHour;
    });
    
    // Show or hide button based on availability
    if (isAvailable) {
      floatingCallBtn.style.display = 'flex';
    } else {
      floatingCallBtn.style.display = 'none';
    }
  }
  
  // Check availability immediately
  checkAvailability();
  
  // Recheck every minute to update visibility
  setInterval(checkAvailability, 60000);

  // ===========================================
  // INITIALIZATION
  // ===========================================
  
  initReviewCarousel();
});