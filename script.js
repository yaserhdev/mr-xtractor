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
});