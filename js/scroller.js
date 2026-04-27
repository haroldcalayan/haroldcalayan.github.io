(function () {
    // Global dragging state (only one can be dragged at a time)
    let isDown = false;
    let isPaused = false;
    let startX;
    let scrollLeft;
    let isDragging = false;
    let activeScroller = null;

    const scrollSpeed = 0.5;

    function initScroller(scroller) {
        if (scroller.dataset.initialized) return;
        scroller.dataset.initialized = "true";

        // Instance-specific state
        let direction = 1;
        let lastScrollLeft = 0;
        let stalledFrames = 0;
        let isInstancePaused = false;
        let animationId = null;

        // Disable scroll snap for smooth auto-scroll
        scroller.style.scrollSnapType = 'none';

        function step() {
            // Check if this specific scroller is NOT being manually interacted with
            const isBeingDragged = (isDown && activeScroller === scroller);
            const noAuto = scroller.dataset.noAuto === "true";

            if (!isInstancePaused && !isBeingDragged && !noAuto) {
                scroller.scrollLeft += scrollSpeed * direction;

                // Wall Detection: If we didn't move after scrolling, flip direction
                if (Math.abs(scroller.scrollLeft - lastScrollLeft) < 0.1) {
                    stalledFrames++;
                    if (stalledFrames > 2) { // Fast flip
                        direction *= -1;
                        stalledFrames = 0;
                    }
                } else {
                    stalledFrames = 0;
                }
                lastScrollLeft = scroller.scrollLeft;
            }
            animationId = requestAnimationFrame(step);
        }

        animationId = requestAnimationFrame(step);

        scroller.addEventListener('mouseenter', () => isInstancePaused = true);
        scroller.addEventListener('mouseleave', () => {
            if (!isDown || activeScroller !== scroller) isInstancePaused = false;
        });
    }

    function scanAndInit() {
        const scrollers = document.querySelectorAll('.portfolio-scroller');
        scrollers.forEach(initScroller);
    }

    // Initialize immediately and on custom event
    scanAndInit();
    document.addEventListener('sectionsLoaded', scanAndInit);

    document.addEventListener('mousedown', (e) => {
        const scroller = e.target.closest('.portfolio-scroller');
        if (!scroller || scroller.dataset.noDrag === "true") return;

        e.preventDefault();

        isDown = true;
        isPaused = true;
        activeScroller = scroller;
        scroller.classList.add('active');
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        isDragging = false;
    });

    document.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        isPaused = false;
        if (activeScroller) {
            activeScroller.classList.remove('active');
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        isPaused = false;
        if (activeScroller) {
            activeScroller.classList.remove('active');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDown || !activeScroller) return;

        const x = e.pageX - activeScroller.offsetLeft;
        const walk = (x - startX) * 1.5;

        if (Math.abs(walk) > 0.1) {
            isDragging = true;
        }

        if (isDragging) {
            e.preventDefault();
            activeScroller.scrollLeft = scrollLeft - walk;
        }
    });

    document.addEventListener('click', (e) => {
        if (isDragging) {
            const scroller = e.target.closest('.portfolio-scroller');
            if (scroller) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            isDragging = false;
        }
    }, true);
})();
