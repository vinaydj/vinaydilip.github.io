// assets/js/project-listing.js - With unique class names
(function() {
    // LIGHTBOX REFERENCES - Using unique IDs
    const overlay = document.getElementById('ctLightboxOverlay');
    const closeBtn = document.getElementById('ctLightboxCloseBtn');
    const lightboxSlider = document.getElementById('ctLightboxSlider');
    const lightboxNav = document.getElementById('ctLightboxNav');
    const captionText = document.getElementById('ctCaptionText');
    const captionIndex = document.getElementById('ctCaptionIndex');
    const prevBtn = document.getElementById('ctLightboxPrev');
    const nextBtn = document.getElementById('ctLightboxNext');

    let currentSlides = [];
    let currentIndex = 0;

    function buildLightbox(sourceSlider) {
        lightboxSlider.innerHTML = '';
        lightboxNav.innerHTML = '';

        const images = sourceSlider.querySelectorAll('img');
        const imageData = [];

        images.forEach((img, idx) => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || `Slide ${idx + 1}`;
            const caption = img.getAttribute('data-caption') || alt;
            imageData.push({ src, alt, caption });
        });

        currentSlides = imageData;

        imageData.forEach((data) => {
            const img = document.createElement('img');
            img.src = data.src;
            img.alt = data.alt;
            img.dataset.caption = data.caption;
            lightboxSlider.appendChild(img);

            const dot = document.createElement('a');
            dot.href = 'javascript:void(0)';
            lightboxNav.appendChild(dot);
        });

        const dots = lightboxNav.querySelectorAll('a');
        if (dots[0]) dots[0].classList.add('active');

        function updateLightboxState() {
            const slideWidth = lightboxSlider.scrollWidth / imageData.length;
            const scrollLeft = lightboxSlider.scrollLeft;
            const activeIndex = Math.round(scrollLeft / slideWidth);
            const clampedIndex = Math.min(Math.max(activeIndex, 0), imageData.length - 1);
            currentIndex = clampedIndex;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === clampedIndex);
            });

            if (imageData[clampedIndex]) {
                captionText.textContent = imageData[clampedIndex].caption;
                captionIndex.textContent = `${clampedIndex + 1} / ${imageData.length}`;
            }
        }

        lightboxSlider.addEventListener('scroll', updateLightboxState);

        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(i);
            });
        });

        function goToSlide(index) {
            const slides = lightboxSlider.querySelectorAll('img');
            if (index < 0) index = 0;
            if (index >= slides.length) index = slides.length - 1;
            if (slides[index]) {
                slides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                setTimeout(updateLightboxState, 200);
            }
        }

        function nextSlide() {
            const slides = lightboxSlider.querySelectorAll('img');
            const nextIndex = Math.min(currentIndex + 1, slides.length - 1);
            goToSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = Math.max(currentIndex - 1, 0);
            goToSlide(prevIndex);
        }

        prevBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        };

        nextBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        };

        document.addEventListener('keydown', function(e) {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        });

        setTimeout(updateLightboxState, 100);

        return { updateLightboxState, goToSlide, nextSlide, prevSlide };
    }

    function openLightbox(sourceSlider) {
        const state = buildLightbox(sourceSlider);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => state.updateLightboxState(), 50);
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Wire up all slider items with unique class name
    document.querySelectorAll('.ct-slider-item').forEach((item) => {
        const sourceSlider = item.querySelector('.ct-img-slider');
        const nav = item.querySelector('.ct-slider-nav');

        item.addEventListener('click', () => openLightbox(sourceSlider));

        if (nav) {
            const slides = sourceSlider.querySelectorAll('img');
            nav.querySelectorAll('a').forEach((dot, i) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const slide = slides[i];
                    if (slide) {
                        slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    }
                });
            });
        }
    });

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });


    // Global variable to keep track of the active zoom instance
let currentPanzoomInstance = null;

function applyZoomToActiveSlide() {
    // 1. If an instance already exists from a previous slide, destroy it safely
    if (currentPanzoomInstance) {
        currentPanzoomInstance.destroy();
    }

    // 2. Target the visible image inside your lightbox slider
    // (Adjust this selector if your script clones or updates a specific active class)
    const activeImg = document.querySelector('.ct-lightbox-slider img'); 

    if (activeImg) {
        // 3. Initialize Panzoom on the CAD drawing
        currentPanzoomInstance = Panzoom(activeImg, {
            maxScale: 6,       // Allows users to zoom in up to 600% to read small text
            minScale: 1,       // Prevents shrinking smaller than the lightbox window
            contain: 'outside', // Keeps the image bounds cleanly aligned
            step: 0.3          // Smooth increments per mousewheel notch
        });

        // 4. Bind the mouse wheel scroll event directly to the zoom controller
        activeImg.parentElement.addEventListener('wheel', function(error) {
            error.preventDefault(); // Prevents the whole webpage from scrolling down
            currentPanzoomInstance.zoomWithWheel(error);
        }, { passive: false });
    }
}

// 5. CRITICAL RESET: When closing your lightbox, reset the transform positions
function resetLightboxZoom() {
    if (currentPanzoomInstance) {
        currentPanzoomInstance.reset();
        currentPanzoomInstance.destroy();
        currentPanzoomInstance = null;
    }
}


    

})();