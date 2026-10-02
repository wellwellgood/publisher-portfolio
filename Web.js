// The browser bundle is loaded before this file; no build step is required.
(() => {
  const heading = document.getElementById('hero-heading');
  if (!heading) return;
  heading.querySelectorAll('.heading-line').forEach(line => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    words.forEach((text, index) => {
      const word = document.createElement('span');
      word.className = 'word';
      word.textContent = text;
      line.appendChild(word);
      if (index < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = heading.querySelectorAll('.word');
  const items = document.querySelectorAll('.load-item');
  const animations = [];
  if (window.anime && typeof window.anime.animate === 'function') {
    try {
      const { animate, stagger } = window.anime;
      // Anime.js owns opacity and transform; do not enable the old CSS transitions.
      animations.push(animate(words, {
        opacity: [0, 1], y: [24, 0], duration: 700,
        delay: stagger(120), ease: 'outCubic',
      }));
      animations.push(animate(items, {
        opacity: [0, 1], y: [12, 0], duration: 650,
        delay: stagger(100, { start: 250 }), ease: 'outCubic',
      }));
      return;
    } catch (error) {
      animations.forEach(animation => animation.revert());
      [...words, ...items].forEach(el => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
      });
      console.warn('Anime.js could not start; using the CSS fallback.', error);
    }
  }
  // A missing library must not disable navigation, video or content visibility.
  document.body.classList.add('animate');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    words.forEach((word, index) => setTimeout(() => word.classList.add('is-visible'), 100 + index * 120));
    items.forEach((item, index) => setTimeout(() => item.classList.add('is-visible'), 300 + index * 140));
  }));
})();

// Honor motion preferences, visibility and autoplay restrictions.
(() => {
  const video = document.querySelector('.background-video');
  const hero = document.querySelector('.hero-frame');
  if (!video || !hero) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  const sync = () => {
    if (preference.matches) {
      video.pause();
      // Reload restores the poster instead of leaving a partially lit frame.
      if (video.dataset.motion !== 'reduced') video.load();
      video.dataset.motion = 'reduced';
      return;
    }
    video.dataset.motion = 'enabled';
    if (document.hidden || !inView) { video.pause(); return; }
    const attempt = video.play();
    if (attempt) attempt.catch(() => { /* The poster remains visible. */ });
  };
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    });
    observer.observe(hero);
  }
  sync();
})();


// Keep the fixed header offset accurate when navigation wraps or fonts load.
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const measure = () => {
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  };
  const updateBackground = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  measure();
  updateBackground();
  window.addEventListener('scroll', updateBackground, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
  if (document.fonts) document.fonts.ready.then(measure);
})();


// Open the implementation notes when a skill link points to the disclosure.
(() => {
  const revealDetails = () => {
    if (location.hash === '#portfolio-details') {
      const details = document.getElementById('portfolio-details');
      if (details) details.open = true;
    }
  };
  window.addEventListener('hashchange', revealDetails);
  revealDetails();
})();

(() => {
  const elements = document.querySelectorAll('.reveal')
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  document.body.classList.add('js-reveal');

  let observer;
  let resizeTimer;

  const observerElements = () => {
    observer?.disconnect();

    const margin = Math.round(window.innerHeight * 0.25);

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    }, {
      root: null,
      rootMargin: `-${margin}px 0px -${margin}px 0px`,
      threshold: 0,
    });

    elements.forEach(el => observer.observe(el));
  };

  observerElements();

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(observerElements, 150);
  }, { passive: true });
})();
