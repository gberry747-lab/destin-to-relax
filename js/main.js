/* Destin To Relax */
(function () {
  "use strict";

  /* ---- showpiece FX switchboard: flip to false to turn one off ---- */
  var FX = { heroRipple: true, droneDescent: true };

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

  const moreWrap = document.querySelector(".gallery-more");
  const moreBtn = document.getElementById("galleryMore");
  const PREVIEW_COUNT = 12;
  let expanded = false;

  function render(filter) {
    current = GALLERY.filter((g) => filter === "all" || g.c === filter);
    const shown = expanded ? current : current.slice(0, PREVIEW_COUNT);
    grid.innerHTML = shown
      .map(
        (g, i) =>
          `<figure class="g-item" data-i="${i}" data-cap="${g.t.replace(/"/g, "&quot;")}">` +
          `<img src="images/thumb/${g.n}.jpg" alt="${g.t.replace(/"/g, "&quot;")}" loading="lazy"></figure>`
      )
      .join("");
    moreBtn.textContent = "Show all " + current.length + " photos";
    moreWrap.style.display = shown.length < current.length ? "" : "none";
  }
  render("all");

  moreBtn.addEventListener("click", () => {
    expanded = true;
    const active = filters.querySelector(".gf.active");
    render(active ? active.dataset.f : "all");
  });

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
  /* ---------- scroll-driven day scene (#week) ---------- */
  (function () {
    const scrolly = document.getElementById("weekScrolly");
    if (!scrolly) return;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("static-mode");
    if (reduced) return; /* keep the classic grid */

    const section = document.getElementById("week");
    const fallback = document.getElementById("weekFallback");
    const sky = document.getElementById("wsSky");
    const sun = document.getElementById("wsSun");
    const stars = document.getElementById("wsStars");
    const water = document.getElementById("wsWater");
    const card = document.getElementById("wsCard");
    const elTime = document.getElementById("wsTime");
    const elTitle = document.getElementById("wsTitle");
    const elDesc = document.getElementById("wsDesc");
    const dotsWrap = document.getElementById("wsDots");

    /* moments come from the fallback grid, so content lives in one place */
    const moments = Array.from(fallback.querySelectorAll(".week-item")).map((it) => ({
      time: it.querySelector(".week-time").textContent,
      title: it.querySelector("h4").textContent,
      desc: it.querySelector("p").textContent,
    }));
    if (moments.length < 2) return;

    /* sky (top, bottom), water color per moment: dawn → morning → midday → golden → dusk → night */
    const skies = [
      ["#57718c", "#f2c9a0", "#3f6d74"],
      ["#5fa8cc", "#cfe8ee", "#2e7d8c"],
      ["#4f9fd0", "#bfe3ec", "#2a8391"],
      ["#7c88b8", "#f4a259", "#3a6474"],
      ["#3b3660", "#c2564b", "#273848"],
      ["#10222e", "#1b2a40", "#0d1a26"],
    ];

    for (let i = 0; i < 46; i++) {
      const s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 55 + "%";
      s.style.animationDelay = Math.random() * 2.8 + "s";
      stars.appendChild(s);
    }
    const dots = moments.map(() => {
      const d = document.createElement("i");
      dotsWrap.appendChild(d);
      return d;
    });

    section.classList.add("scrolly-on");
    scrolly.setAttribute("aria-hidden", "false");
    fallback.setAttribute("aria-hidden", "true");

    const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    function mix(a, b, t) {
      const A = hex(a), B = hex(b);
      return (
        "rgb(" +
        Math.round(A[0] + (B[0] - A[0]) * t) + "," +
        Math.round(A[1] + (B[1] - A[1]) * t) + "," +
        Math.round(A[2] + (B[2] - A[2]) * t) + ")"
      );
    }

    let lastIdx = -1, swapTimer = null;
    function setCard(idx) {
      if (idx === lastIdx) return;
      lastIdx = idx;
      dots.forEach((d, i) => d.classList.toggle("on", i === idx));
      card.classList.add("swap");
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        elTime.textContent = moments[idx].time;
        elTitle.textContent = moments[idx].title;
        elDesc.textContent = moments[idx].desc;
        card.classList.remove("swap");
      }, 160);
    }

    const segs = moments.length - 1;
    function apply(p) {
      const f = Math.min(segs - 0.0001, p * segs);
      const i = Math.floor(f), t = f - i;
      sky.style.background = "linear-gradient(" + mix(skies[i][0], skies[i + 1][0], t) + "," + mix(skies[i][1], skies[i + 1][1], t) + ")";
      water.style.background = "linear-gradient(rgba(255,255,255,0.06)," + mix(skies[i][2], skies[i + 1][2], t) + ")";
      /* sun rises left, peaks mid-afternoon, sets right */
      const x = 12 + 76 * p;
      const y = 18 + 55 * Math.pow((p - 0.45) / 0.55, 2);
      sun.style.left = x + "%";
      sun.style.top = Math.min(88, y) + "%";
      sun.style.opacity = Math.max(0, 1 - Math.max(0, p - 0.82) * 6);
      stars.style.opacity = Math.min(1, Math.max(0, (p - 0.8) / 0.18));
      setCard(Math.round(p * segs));
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = scrolly.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
        apply(p);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply(0);
    lastIdx = -1;
    setCard(0);
  })();

  /* ---------- FX: drone descent (#descent) ---------- */
  (function () {
    const el = document.getElementById("descent");
    if (!el || !FX.droneDescent) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("static-mode")
    )
      return;
    document.documentElement.classList.add("descent-on");
    el.setAttribute("aria-hidden", "false");

    const layers = Array.from(el.querySelectorAll(".d-layer"));
    layers.forEach((l) => (l.style.transformOrigin = l.dataset.origin));
    const cap = document.getElementById("dCap");
    const lineEl = document.getElementById("dLine");
    const lines = [
      "See that pin? Gulf, lake - and your house.",
      "Closer. The lake wraps around your backyard.",
      "Welcome down. The pool's already warm.",
    ];
    /* each layer scales through its window; upper layers fade in on top.
       Long, eased crossfades so each photo dissolves in rather than cutting. */
    const win = [ [0, 0.52], [0.3, 0.84], [0.6, 1] ];
    const fadeIn = [null, [0.28, 0.48], [0.58, 0.78]];
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const ease = (t) => t * t * (3 - 2 * t); /* smoothstep */

    let lastIdx = -1, swapTimer = null;
    function setLine(idx) {
      if (idx === lastIdx) return;
      lastIdx = idx;
      cap.classList.add("swap");
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        lineEl.textContent = lines[idx];
        cap.classList.remove("swap");
      }, 150);
    }

    function apply(p) {
      /* cross-zoom dissolve: incoming starts slightly wide and zooms with the
         outgoing layer while a soft blur ramps across the handoff - reads as a morph */
      const death = [fadeIn[1], fadeIn[2], null];
      layers.forEach((l, i) => {
        const t = ease(clamp01((p - win[i][0]) / (win[i][1] - win[i][0])));
        const pre = fadeIn[i] ? 0.92 : 1;
        l.style.transform = "scale(" + (pre + (1.45 - pre) * t) + ")";
        const op = fadeIn[i] ? ease(clamp01((p - fadeIn[i][0]) / (fadeIn[i][1] - fadeIn[i][0]))) : 1;
        l.style.opacity = op;
        let blur = 0;
        if (fadeIn[i]) blur += 2.5 * (1 - op);
        if (death[i]) blur += 2.5 * ease(clamp01((p - death[i][0]) / (death[i][1] - death[i][0])));
        l.style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none";
      });
      setLine(p < 0.38 ? 0 : p < 0.68 ? 1 : 2);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = clamp01(-r.top / ((r.height - window.innerHeight) || 1));
        apply(p);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply(0);
    lastIdx = -1;
    setLine(0);
  })();

  /* ---------- FX: touchable lake hero (WebGL ripple) ---------- */
  (function () {
    if (!FX.heroRipple) return;
    if (location.protocol === "file:") return; /* browsers block WebGL image reads on file:// */
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("static-mode")
    )
      return;
    const heroEl = document.querySelector(".hero");
    const media = heroEl && heroEl.querySelector(".hero-media");
    const img = media && media.querySelector("img");
    if (!img) return;

    function boot(srcImg) {
      const cv = document.createElement("canvas");
      cv.setAttribute("aria-hidden", "true");
      const gl = cv.getContext("webgl", { alpha: false, antialias: false });
      if (!gl) return; /* no WebGL: hero stays exactly as it is */
      /* canvas is NOT added to the page here - only after the first frame is drawn */

      const VS =
        "attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x,1.0-a.y);gl_Position=vec4(a*2.0-1.0,0.0,1.0);}";
      const FS =
        "precision mediump float;varying vec2 v;uniform sampler2D uImg,uH;uniform vec2 uPx,uScale,uOff;" +
        "void main(){" +
        "float hl=texture2D(uH,v-vec2(uPx.x,0.)).r,hr=texture2D(uH,v+vec2(uPx.x,0.)).r;" +
        "float ht=texture2D(uH,v-vec2(0.,uPx.y)).r,hb=texture2D(uH,v+vec2(0.,uPx.y)).r;" +
        "vec2 off=vec2(hl-hr,ht-hb)*0.10;" +
        "vec2 uv=(v+off)*uScale+uOff;" +
        "vec4 c=texture2D(uImg,uv);" +
        "c.rgb+=(hl-hr)*1.2;" +
        "gl_FragColor=vec4(c.rgb,1.0);}";
      function sh(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
      const aLoc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(aLoc);
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

      function tex(unit) {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return t;
      }
      /* unit 0: photo, unit 1: ripple heightmap */
      tex(0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcImg);
      } catch (e) {
        return; /* browser refused the image (e.g. file:// security) - photo stays as-is */
      }
      tex(1);
      const SW = 264, SH = 150;
      const h8 = new Uint8Array(SW * SH);
      h8.fill(128);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, SW, SH, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, h8);
      gl.uniform1i(gl.getUniformLocation(prog, "uImg"), 0);
      gl.uniform1i(gl.getUniformLocation(prog, "uH"), 1);
      gl.uniform2f(gl.getUniformLocation(prog, "uPx"), 1 / SW, 1 / SH);
      const uScale = gl.getUniformLocation(prog, "uScale");
      const uOff = gl.getUniformLocation(prog, "uOff");

      function fit() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.min(2200, Math.round(media.clientWidth * dpr));
        cv.height = Math.round(cv.width * (media.clientHeight / Math.max(1, media.clientWidth)));
        gl.viewport(0, 0, cv.width, cv.height);
        /* object-fit: cover mapping */
        const ia = srcImg.naturalWidth / srcImg.naturalHeight;
        const ca = media.clientWidth / Math.max(1, media.clientHeight);
        let sx = 1, sy = 1;
        if (ca > ia) sy = ia / ca;
        else sx = ca / ia;
        gl.uniform2f(uScale, sx, sy);
        gl.uniform2f(uOff, (1 - sx) / 2, (1 - sy) / 2);
      }
      fit();
      window.addEventListener("resize", fit, { passive: true });

      /* ripple physics on small buffers */
      let b1 = new Float32Array(SW * SH), b2 = new Float32Array(SW * SH);
      function drop(nx, ny, s) {
        const x = Math.round(nx * SW), y = Math.round(ny * SH);
        if (x < 2 || y < 2 || x > SW - 3 || y > SH - 3) return;
        b1[y * SW + x] = s;
      }
      let visible = true;
      new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.02 }).observe(heroEl);

      function step() {
        for (let y = 1; y < SH - 1; y++)
          for (let x = 1; x < SW - 1; x++) {
            const i = y * SW + x;
            b2[i] = ((b1[i - 1] + b1[i + 1] + b1[i - SW] + b1[i + SW]) / 2 - b2[i]) * 0.984;
          }
        const t = b1; b1 = b2; b2 = t;
        for (let i = 0; i < SW * SH; i++) {
          let v = b1[i] * 0.5 + 128;
          h8[i] = v < 0 ? 0 : v > 255 ? 255 : v;
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SW, SH, gl.LUMINANCE, gl.UNSIGNED_BYTE, h8);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      /* only swap the photo out once a real frame has been drawn */
      let fitTick = 0, shown = false;
      (function loop() {
        if (++fitTick % 30 === 0 && cv.width < 10 && media.clientWidth > 10) fit();
        if (visible && cv.width > 10) {
          step();
          if (!shown) {
            shown = true;
            media.appendChild(cv);
            heroEl.classList.add("ripple-on");
          }
        }
        requestAnimationFrame(loop);
      })();

      function pt(e) {
        const r = media.getBoundingClientRect();
        drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 340);
      }
      heroEl.addEventListener("pointermove", pt, { passive: true });
      heroEl.addEventListener("pointerdown", pt, { passive: true });
      /* ambient droplets on the lake while idle */
      setInterval(() => {
        if (visible) drop(0.12 + Math.random() * 0.76, 0.42 + Math.random() * 0.5, 220);
      }, 1700);
    }

    /* load our own copy for the texture - immune to the DOM img's srcset/decode state.
       Wait for both the image AND a real layout before booting. */
    const source = new Image();
    source.addEventListener(
      "load",
      function () {
        (function whenSized() {
          if (media.clientWidth > 10 && media.clientHeight > 10) boot(source);
          else setTimeout(whenSized, 300);
        })();
      },
      { once: true }
    );
    source.src = img.currentSrc || img.src;
  })();

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
