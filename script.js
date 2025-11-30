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
// 3D REVIEW CAROUSEL
// ===========================================
const initCarousel = () => {
    const carousel = document.querySelector('.carousel');
    const cards = document.querySelectorAll('.carousel-card');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    
    if (!carousel || cards.length === 0) return;
    
    const totalCards = cards.length;
    let currentIndex = 0;
    let currentRotation = 0;
    let autoplayInterval = null;
    const autoplayDelay = 5000;
    
    // Mobile breakpoint - must match CSS
    const mobileBreakpoint = 650;
    
    // Calculate rotation angle for each card
    const theta = 360 / totalCards;
    
    // Get card width dynamically
    const getCardWidth = () => cards[0].offsetWidth;
    
    // Check if mobile view (no 3D)
    const isMobileView = () => window.innerWidth <= mobileBreakpoint;
    
    // Get gap based on viewport width
    const getCardGap = () => {
        if (window.innerWidth <= 800) {
            return 20;
        } else if (window.innerWidth <= 1000) {
            return 25;
        }
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
        indicator.addEventListener('click', () => goToSlide(index));
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
    
    // Update carousel rotation
    const rotateCarousel = () => {
        if (isMobileView()) {
            carousel.style.transform = 'none';
        } else {
            const radius = getRadius();
            carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation}deg)`;
        }
        
        // Update active states
        cards.forEach((card, index) => {
            card.classList.toggle('is-active', index === currentIndex);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('is-active', index === currentIndex);
        });
    };
    
    // Navigation functions
    const goToSlide = (index) => {
        let diff = index - currentIndex;
        
        if (diff > totalCards / 2) {
            diff -= totalCards;
        } else if (diff < -totalCards / 2) {
            diff += totalCards;
        }
        
        currentRotation -= diff * theta;
        currentIndex = index;
        rotateCarousel();
        resetAutoplay();
    };
    
    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % totalCards;
        currentRotation -= theta;
        rotateCarousel();
    };
    
    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        currentRotation += theta;
        rotateCarousel();
    };
    
    // Autoplay functions
    const startAutoplay = () => {
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    };
    
    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    };
    
    const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };
    
    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });
    
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });
    
    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            positionCards();
            rotateCarousel();
        }, 100);
    });
    
    // Initialize
    positionCards();
    rotateCarousel();
    startAutoplay();
};

// Add this to the end of your existing DOMContentLoaded callback
initCarousel();
});