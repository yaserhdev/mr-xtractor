document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('DOMContentLoaded', () => {
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  });

  const cards = document.querySelectorAll('.card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    },
    {
      threshold: 0.1 // Trigger when 10% of the card is visible
    }
  );

  cards.forEach(card => {
    observer.observe(card);
  });

  const tabs = document.querySelectorAll('.tabs li');
  const categoryDivs = {
    'Coupes': document.querySelector('.coupes'),
    'Sedans': document.querySelector('.sedans'),
    'SUVs': document.querySelector('.suvs'),
    'Trucks': document.querySelector('.trucks')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('is-active'));

      // Add active class to clicked tab
      tab.classList.add('is-active');

      // Get the category name from the clicked tab
      const categoryName = tab.querySelector('a').textContent;

      // Hide all category divs
      Object.values(categoryDivs).forEach(div => {
        if (div) div.classList.add('is-hidden');
      });

      // Show the selected category div
      if (categoryDivs[categoryName]) {
        categoryDivs[categoryName].classList.remove('is-hidden');
      }
    });
  });

// ===========================================
// 3D REVIEW CAROUSEL (SMOOTH CONTINUOUS ROTATION)
// ===========================================
const initCarousel = () => {
    const carousel = document.querySelector('.carousel');
    const cards = document.querySelectorAll('.carousel-card');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (!carousel || cards.length === 0) return;

    const totalCards = cards.length;
    const theta = 360 / totalCards;
    const mobileBreakpoint = 650;

    // Rotation state
    let currentRotation = 0;
    let targetRotation = 0;
    let rotationVelocity = 0;
    let isAutoRotating = true;
    let isUserInteracting = false;
    let isHovering = false;
    let pauseTimeout = null;
    let mobileCurrentIndex = 0; // Track current index in mobile view

    // Auto-rotation speed (degrees per frame at 60fps)
    const autoRotationSpeed = 0.05; // Continuous rotation speed

    // Touch/drag state
    let touchStartX = 0;
    let touchStartRotation = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;

    // Physics constants
    const friction = 0.95; // Velocity decay
    const snapStrength = 0.2; // How fast buttons snap to position

    // Get card width dynamically
    const getCardWidth = () => cards[0].offsetWidth;

    // Check if mobile view (no 3D)
    const isMobileView = () => window.innerWidth <= mobileBreakpoint;

    // Get gap based on viewport width
    const getCardGap = () => {
        if (window.innerWidth <= 800) return 20;
        else if (window.innerWidth <= 1000) return 25;
        return 30;
    };

    // Calculate radius to achieve desired gap between cards
    const getRadius = () => {
        if (isMobileView()) return 0;
        const cardWidth = getCardWidth();
        const cardGap = getCardGap();
        const baseRadius = Math.round((cardWidth / 2) / Math.tan(Math.PI / totalCards));
        const gapAdjustment = cardGap / (2 * Math.sin(Math.PI / totalCards));
        return Math.round(baseRadius + gapAdjustment);
    };

    // Create indicator dots
    cards.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.classList.add('carousel-indicator');
        indicator.setAttribute('aria-label', `Go to review ${index + 1}`);
        if (index === 0) indicator.classList.add('is-active');
        indicator.addEventListener('click', () => snapToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    const indicators = document.querySelectorAll('.carousel-indicator');

    // Position cards in 3D space
    const positionCards = () => {
        if (isMobileView()) {
            cards.forEach(card => {
                card.style.transform = 'none';
            });
            return;
        }

        const radius = getRadius();
        cards.forEach((card, index) => {
            const angle = theta * index;
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
    };

    // Get current active card index based on rotation
    const getCurrentIndex = () => {
        if (isMobileView()) {
            return mobileCurrentIndex;
        }
        // Since we rotate negatively, we need to negate and normalize
        const normalizedRotation = ((-currentRotation % 360) + 360) % 360;
        const index = Math.round(normalizedRotation / theta) % totalCards;
        return index;
    };

    // Update active states based on current rotation
    const updateActiveStates = () => {
        const currentIndex = getCurrentIndex();

        cards.forEach((card, index) => {
            card.classList.toggle('is-active', index === currentIndex);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('is-active', index === currentIndex);
        });
    };

    // Snap to specific slide (used by buttons and indicators)
    const snapToSlide = (targetIndex) => {
        if (isMobileView()) {
            // In mobile view, just update the index
            mobileCurrentIndex = targetIndex;
            updateActiveStates();
            return;
        }

        isAutoRotating = false;
        rotationVelocity = 0;

        // Clear any existing pause timeout
        if (pauseTimeout) {
            clearTimeout(pauseTimeout);
            pauseTimeout = null;
        }

        // Calculate the exact rotation needed to center the target card
        // We want the carousel at exactly -targetIndex * theta
        const desiredRotation = -targetIndex * theta;

        // Find the closest equivalent rotation to current position
        // (accounting for the fact that rotation is continuous/infinite)
        const currentNormalized = currentRotation % 360;
        const desiredNormalized = desiredRotation % 360;

        // Calculate shortest path
        let diff = desiredNormalized - currentNormalized;
        if (diff > 180) {
            diff -= 360;
        } else if (diff < -180) {
            diff += 360;
        }

        targetRotation = currentRotation + diff;
    };

    // Animation loop
    const animate = () => {
        if (isMobileView()) {
            // Mobile view doesn't use 3D transforms, just update active states
            updateActiveStates();
            requestAnimationFrame(animate);
            return;
        }

        // Auto-rotation (smooth continuous)
        if (isAutoRotating && !isUserInteracting) {
            currentRotation -= autoRotationSpeed;
        }

        // Handle snapping to target (for button clicks)
        if (!isAutoRotating && Math.abs(targetRotation - currentRotation) > 0.1) {
            currentRotation += (targetRotation - currentRotation) * snapStrength;
        } else if (!isAutoRotating && Math.abs(targetRotation - currentRotation) <= 0.1) {
            currentRotation = targetRotation;
            // Start pause timer when snap completes (only if not already set)
            if (!pauseTimeout && !isHovering) {
                pauseTimeout = setTimeout(() => {
                    if (!isUserInteracting && !isHovering) {
                        isAutoRotating = true;
                    }
                    pauseTimeout = null;
                }, 1000);
            }
        }

        // Apply velocity with friction (for momentum after swipe)
        if (Math.abs(rotationVelocity) > 0.01) {
            currentRotation += rotationVelocity;
            rotationVelocity *= friction;
        } else if (!isAutoRotating) {
            rotationVelocity = 0;
        }

        // Apply rotation
        const radius = getRadius();
        carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation}deg)`;

        updateActiveStates();
        requestAnimationFrame(animate);
    };

    // Button navigation
    prevBtn.addEventListener('click', () => {
        const currentIndex = getCurrentIndex();
        snapToSlide((currentIndex - 1 + totalCards) % totalCards);
    });

    nextBtn.addEventListener('click', () => {
        const currentIndex = getCurrentIndex();
        snapToSlide((currentIndex + 1) % totalCards);
    });

    // Pause on hover
    const carouselScene = document.querySelector('.carousel-scene');
    carouselScene.addEventListener('mouseenter', () => {
        isHovering = true;
        isAutoRotating = false;
        rotationVelocity = 0;
    });

    carouselScene.addEventListener('mouseleave', () => {
        isHovering = false;
        if (!isUserInteracting) {
            isAutoRotating = true;
        }
    });

    // Touch/Swipe with momentum physics
    carousel.addEventListener('touchstart', (e) => {
        isUserInteracting = true;
        isAutoRotating = false;
        touchStartX = e.touches[0].clientX;
        touchStartRotation = currentRotation;
        lastTouchX = touchStartX;
        lastTouchTime = Date.now();
        touchVelocity = 0;
        rotationVelocity = 0;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        if (!isUserInteracting) return;

        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        const now = Date.now();
        const deltaTime = now - lastTouchTime;

        // Calculate rotation based on drag distance
        // Adjust sensitivity: more pixels = more rotation
        const rotationDelta = deltaX * 0.3;
        currentRotation = touchStartRotation + rotationDelta;

        // Calculate velocity for momentum
        if (deltaTime > 0) {
            const deltaMove = touchX - lastTouchX;
            touchVelocity = (deltaMove / deltaTime) * 16; // Normalize to ~60fps
        }

        lastTouchX = touchX;
        lastTouchTime = now;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
        isUserInteracting = false;

        // Apply momentum based on swipe velocity
        rotationVelocity = touchVelocity * 0.5; // Adjust momentum strength

        // If velocity is low, resume auto-rotation
        if (Math.abs(rotationVelocity) < 1) {
            isAutoRotating = true;
        } else {
            // Auto-rotation resumes after momentum fades
            setTimeout(() => {
                if (Math.abs(rotationVelocity) < 0.1) {
                    isAutoRotating = true;
                }
            }, 500);
        }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            const currentIndex = getCurrentIndex();
            snapToSlide((currentIndex + 1) % totalCards);
        } else if (e.key === 'ArrowRight') {
            const currentIndex = getCurrentIndex();
            snapToSlide((currentIndex - 1 + totalCards) % totalCards);
        }
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            positionCards();
        }, 100);
    });

    // Initialize
    positionCards();
    animate();
};

// Add this to the end of your existing DOMContentLoaded callback
initCarousel();
});