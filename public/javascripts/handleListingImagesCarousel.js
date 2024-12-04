export function handleListingImagesCarousel() {
    const carousel = document.querySelector('.carousel-images');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicators = document.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;

    const images = carousel.querySelectorAll('img');
    const totalImages = images.length;

    function updateButtonVisibility() {
        prevBtn.classList.toggle('hidden', currentIndex === 0);
        nextBtn.classList.toggle('hidden', currentIndex === totalImages - 1);
    }

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function moveCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateButtonVisibility();
        updateIndicators();
    }

    updateButtonVisibility();

    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % totalImages;
        moveCarousel();
    });

    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        moveCarousel();
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            moveCarousel();
        });
    });
}