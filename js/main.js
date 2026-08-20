/* Destin To Relax */
(function () {
  "use strict";

  /* test mode: ?static=1 disables animations and reveals everything */
  if (/[?&]static=1/.test(location.search)) {
    document.documentElement.classList.add("static-mode");
  }

  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  const onScroll = () => nav.classList.toggle("solid", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });

  /* ---------- sticky mobile CTA ---------- */
  const bar = document.getElementById("mobileBar");
  if (bar) {
    const hero = document.querySelector(".hero");
    new IntersectionObserver(
      ([en]) => bar.classList.toggle("show", !en.isIntersecting),
      { threshold: 0.05 }
    ).observe(hero);
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- stat count-up ---------- */
  const fmt = (v, dec) => (dec ? v.toFixed(1) : Math.round(v).toLocaleString("en-US"));
  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        statIO.unobserve(en.target);
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const dec = el.dataset.count.includes(".");
        if (document.documentElement.classList.contains("static-mode")) {
          el.textContent = fmt(target, dec) + (el.dataset.suffix || "");
          return;
        }
        const t0 = performance.now();
        const dur = 1400;
        (function tick(t) {
          const p = Math.min((t - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * ease, dec) + (el.dataset.suffix || "");
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".stat strong").forEach((el) => statIO.observe(el));

  /* ---------- gallery ---------- */
  const grid = document.getElementById("galleryGrid");
  const filters = document.getElementById("galleryFilters");
  let current = [];
  let lbIndex = 0;

  function render(filter) {
    current = GALLERY.filter((g) => filter === "all" || g.c === filter);
    grid.innerHTML = current
      .map(
        (g, i) =>
          `<figure class="g-item" data-i="${i}" data-cap="${g.t.replace(/"/g, "&quot;")}">` +
          `<img src="images/thumb/${g.n}.jpg" alt="${g.t.replace(/"/g, "&quot;")}" loading="lazy"></figure>`
      )
      .join("");
  }
  render("all");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".gf");
    if (!btn) return;
    filters.querySelectorAll(".gf").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.f);
  });

  /* ---------- lightbox ---------- */
  const lb = document.getElementById("lb");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");

  function openLB(i) {
    lbIndex = i;
    const g = current[i];
    lbImg.src = "images/full/" + g.n + ".jpg";
    lbImg.alt = g.t;
    lbCap.textContent = g.t + "  ·  " + (i + 1) + " / " + current.length;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLB() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function step(d) {
    openLB((lbIndex + d + current.length) % current.length);
  }

  grid.addEventListener("click", (e) => {
    const fig = e.target.closest(".g-item");
    if (fig) openLB(parseInt(fig.dataset.i, 10));
  });
  document.getElementById("lbClose").addEventListener("click", closeLB);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  /* swipe */
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener(
    "touchend",
    (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
      tx = null;
    },
    { passive: true }
  );
})();
