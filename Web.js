const menu = document.querySelector(".menu"),
  toggle = document.querySelector(".menu-toggle"),
  links = [...document.querySelectorAll('.menu a[href^="#"]')],
  sections = [...document.querySelectorAll("main section[id]")];
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.forEach((a) =>
  a.addEventListener("click", () => menu.classList.remove("open")),
);
const reveal = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target
        .querySelectorAll("[data-level]")
        .forEach(
          (c) => (c.querySelector("u").style.width = c.dataset.level + "%"),
        );
      reveal.unobserve(e.target);
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting)
        links.forEach((a) =>
          a.classList.toggle("active", a.hash === "#" + e.target.id),
        );
    }),
  { rootMargin: "-35% 0px -55%" },
);
sections.forEach((s) => spy.observe(s));
