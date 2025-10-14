document.addEventListener('DOMContentLoaded', () => {
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
});