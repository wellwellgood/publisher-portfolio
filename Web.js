(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const heading = document.getElementById("hero-heading");
  if (!heading) return;
  heading.querySelectorAll(".heading-line").forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = "";
    line.setAttribute("aria-hidden", "true");
    words.forEach((text, index) => {
      const word = document.createElement("span");
      word.className = "word";
      word.textContent = text;
      line.appendChild(word);
      if (index < words.length - 1)
        line.appendChild(document.createTextNode(" "));
    });
  });
  if (reducedMotion) return;
  document.body.classList.add("animate");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      heading.querySelectorAll(".word").forEach((word, index) => {
        setTimeout(
          () => word.classList.add("is-visible"),
          100 + index * 120,
        );
      });
      document.querySelectorAll(".load-item").forEach((item, index) => {
        setTimeout(
          () => item.classList.add("is-visible"),
          300 + index * 140,
        );
      });
    }),
  );
})();

(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elements = document.querySelectorAll(".reveal");
  const show = (el) => {
    el.classList.add("visible");

  };
  if (reduced || !("IntersectionObserver" in window)) {
    elements.forEach(show);
    return;
  }
  document.body.classList.add("js-reveal");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  elements.forEach((el) => observer.observe(el));
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
