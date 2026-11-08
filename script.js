/* ==========================================================
   Portfolio scripts: plain JavaScript, no libraries.
   Sections:
   1. Constellation navigation (MENU button + overlay)
   2. Going to a section (smooth scroll + arrival animation)
   3. Active section highlight
   4. Theme toggle (dark = default)
   5. Cinematic background (parallax, particles, light streaks)
   6. Intro helper and first-visit hint
   7. Back-to-top button          10. Contact form validation
   8. Project search + filters    11. Profile image fallback
   9. Project / certificate modals
   Everything in sections 5-6 is decoration: if it fails, the site still works.
   ========================================================== */

var root = document.documentElement;
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Constellation navigation ---------- */
var menuBtn = document.getElementById("menuBtn");
var menuBtnLabel = document.getElementById("menuBtnLabel");
var menuHint = document.getElementById("menuHint");
var menu = document.getElementById("menuOverlay");
var orbits = document.getElementById("menuOrbits");
var core = document.getElementById("menuCore");
var themeToggle = document.getElementById("themeToggle");
var nodeItems = Array.prototype.slice.call(menu.querySelectorAll(".node"));
var navLinks = Array.prototype.slice.call(menu.querySelectorAll(".node__link"));
var menuOpen = false;
var menuReturnFocus = null;
var SVG_NS = "http://www.w3.org/2000/svg";

// Works out sizes and places the seven diamonds on an ellipse around the centre logo.
function layoutMenu() {
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  var S = vw < 380 ? 70 : vw < 420 ? 76 : vw < 600 ? 84 : vw < 900 ? 100 : 116;   // diamond side
  S = Math.min(S, Math.max(58, vh * 0.16));                                        // very short screens
  var D = S * 1.4142;                                                              // diamond width/height
  var Cs = S * 0.92;                                                               // centre logo side

  var rx = Math.min(vw / 2 - D / 2 - 10, vw < 600 ? 150 : 400);
  var ryCap = vw < 600 ? 270 : vw < 900 ? 360 : 280;
  var ry = Math.max(Math.min(vh / 2 - D / 2 - 64, ryCap), S * 1.5);
  rx = Math.max(rx, S * 1.4);

  menu.style.setProperty("--S", S + "px");
  menu.style.setProperty("--Cs", Cs + "px");

  var cx = vw / 2, cy = vh / 2;
  var count = nodeItems.length;
  var points = [];
  nodeItems.forEach(function (item, k) {
    var a = (-90 + (360 / count) * k) * Math.PI / 180;     // first item at the top, spaced evenly = symmetrical
    var x = rx * Math.cos(a), y = ry * Math.sin(a);
    points.push({ x: x, y: y });
    item.style.setProperty("--tx", x.toFixed(1) + "px");
    item.style.setProperty("--ty", y.toFixed(1) + "px");
  });

  buildOrbits(vw, vh, cx, cy, rx, ry, D, Cs * 1.4142, points);
}

// Draws the glowing orbital curves, spokes, sparkles and travelling light pulses.
function buildOrbits(vw, vh, cx, cy, rx, ry, D, coreD, points) {
  orbits.setAttribute("viewBox", "0 0 " + vw + " " + vh);
  var out = "";

  // spokes from the centre logo to every diamond
  points.forEach(function (p) {
    var len = Math.sqrt(p.x * p.x + p.y * p.y);
    var ux = p.x / len, uy = p.y / len;
    var x1 = cx + ux * (coreD / 2 + 4), y1 = cy + uy * (coreD / 2 + 4);
    var x2 = cx + p.x - ux * (D / 2 - 6), y2 = cy + p.y - uy * (D / 2 - 6);
    out += '<line class="spoke" pathLength="1" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
  });

  // main ring through the seven diamonds
  var ring = "M" + (cx + rx) + "," + cy + " A" + rx + "," + ry + " 0 1 1 " + (cx - rx) + "," + cy + " A" + rx + "," + ry + " 0 1 1 " + (cx + rx) + "," + cy;
  out += '<path id="orbitRing" class="orbit orbit--ring" pathLength="1" d="' + ring + '"/>';

  // two tilted "swoosh" orbits (like the reference image)
  var sx = Math.min(rx * 1.28 + D * 0.15, vw / 2 - 8), sy = ry * 0.46;
  var sw = "M" + (cx + sx) + "," + cy + " A" + sx + "," + sy + " 0 1 1 " + (cx - sx) + "," + cy + " A" + sx + "," + sy + " 0 1 1 " + (cx + sx) + "," + cy;
  out += '<path class="orbit orbit--swoosh" pathLength="1" d="' + sw + '" transform="rotate(-9 ' + cx + " " + cy + ')"/>';
  out += '<path class="orbit orbit--swoosh" pathLength="1" d="' + sw + '" transform="rotate(171 ' + cx + " " + cy + ')"/>';

  // sparkles
  [[-0.78, -0.62, 7], [0.82, 0.66, 6], [0.2, -1.12, 5]].forEach(function (s) {
    var x = cx + rx * s[0], y = cy + ry * s[1], r = s[2];
    out += '<path class="star" d="M' + x + "," + (y - r * 1.6) + " L" + (x + r * 0.35) + "," + (y - r * 0.35) + " L" + (x + r * 1.6) + "," + y + " L" + (x + r * 0.35) + "," + (y + r * 0.35) + " L" + x + "," + (y + r * 1.6) + " L" + (x - r * 0.35) + "," + (y + r * 0.35) + " L" + (x - r * 1.6) + "," + y + " L" + (x - r * 0.35) + "," + (y - r * 0.35) + ' Z"/>';
  });

  // light pulses travelling along the ring
  if (!reduceMotion) {
    out += '<circle class="pulse" r="3"><animateMotion dur="10s" repeatCount="indefinite"><mpath href="#orbitRing"/></animateMotion></circle>';
    out += '<circle class="pulse" r="2.2"><animateMotion dur="10s" begin="-5s" repeatCount="indefinite"><mpath href="#orbitRing"/></animateMotion></circle>';
  }
  orbits.innerHTML = out;
}

function lockScroll() {
  var bar = window.innerWidth - root.clientWidth;          // width of the scrollbar, so the page does not jump
  root.style.setProperty("--sbw", bar + "px");
  document.body.style.paddingRight = bar + "px";
  root.style.overflow = "hidden";
}
function unlockScroll() {
  root.style.overflow = "";
  document.body.style.paddingRight = "";
  root.style.setProperty("--sbw", "0px");
}

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  menuReturnFocus = document.activeElement;
  layoutMenu();
  lockScroll();
  menu.removeAttribute("inert");
  menu.setAttribute("aria-hidden", "false");
  menu.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.setAttribute("aria-label", "Close navigation menu");
  menuBtnLabel.textContent = "Close";
  hideHint();
  var start = menu.querySelector(".node__link.is-active") || navLinks[0];
  setTimeout(function () { if (menuOpen) start.focus({ preventScroll: true }); }, 500);
}

function closeMenu(returnFocus) {
  if (!menuOpen) return;
  menuOpen = false;
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menu.setAttribute("aria-hidden", "true");
  menu.setAttribute("inert", "");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open navigation menu");
  menuBtnLabel.textContent = "Menu";
  unlockScroll();
  if (returnFocus !== false && menuReturnFocus && menuReturnFocus.focus) menuReturnFocus.focus({ preventScroll: true });
}

menuBtn.addEventListener("click", function () { if (menuOpen) { closeMenu(); } else { openMenu(); } });
core.addEventListener("click", function () { closeMenu(); });

// Click anywhere outside the diamonds / logo / theme button closes the menu
menu.addEventListener("click", function (e) {
  if (!e.target.closest(".node__link, .core, .theme-toggle")) closeMenu();
});

document.addEventListener("keydown", function (e) {
  if (!menuOpen) return;
  var items = navLinks.concat([core, themeToggle, menuBtn]);
  var i = items.indexOf(document.activeElement);

  if (e.key === "Escape") { closeMenu(); return; }

  if (e.key === "Tab") {                                   // keep keyboard focus inside the open menu
    e.preventDefault();
    var next = e.shiftKey ? i - 1 : i + 1;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items[next].focus();
    return;
  }
  var li = navLinks.indexOf(document.activeElement);
  if (li !== -1 && (e.key === "ArrowRight" || e.key === "ArrowDown")) { e.preventDefault(); navLinks[(li + 1) % navLinks.length].focus(); }
  if (li !== -1 && (e.key === "ArrowLeft" || e.key === "ArrowUp")) { e.preventDefault(); navLinks[(li - 1 + navLinks.length) % navLinks.length].focus(); }
});

var resizeTimer = null;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () { layoutMenu(); }, 80);
});
layoutMenu();

/* ---------- 2. Going to a section ---------- */
// Smooth scroll plus a short fade / scale / rise on the section you arrive at.
function goToSection(id, delay) {
  var el = document.getElementById(id);
  if (!el) return;
  setTimeout(function () {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    try { history.replaceState(null, "", "#" + id); } catch (err) { /* ignore */ }
    if (!reduceMotion && el.animate) {
      el.animate(
        [{ opacity: 0.2, transform: "translateY(40px) scale(.985)" }, { opacity: 1, transform: "none" }],
        { duration: 950, delay: 250, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" }
      );
    }
  }, delay || 0);
}

// Every in-page link (menu diamonds, hero buttons, "Next") uses the same transition
document.addEventListener("click", function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link || link.classList.contains("skip-link")) return;
  var id = link.getAttribute("href").slice(1);
  if (!id || !document.getElementById(id)) return;
  e.preventDefault();
  var wasOpen = menuOpen;
  if (wasOpen) closeMenu(false);
  goToSection(id, wasOpen ? (reduceMotion ? 0 : 420) : 0);
});

/* ---------- 3. Active section highlight ---------- */
var sectionIds = navLinks.map(function (l) { return l.getAttribute("data-target"); });

function updateActiveLink() {
  var current = sectionIds[0];
  var marker = window.scrollY + window.innerHeight * 0.35;
  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.offsetTop <= marker) current = id;
  });
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
    current = sectionIds[sectionIds.length - 1];
  }
  navLinks.forEach(function (link) {
    var active = link.getAttribute("data-target") === current;
    link.classList.toggle("is-active", active);
    if (active) { link.setAttribute("aria-current", "true"); } else { link.removeAttribute("aria-current"); }
  });
}

/* ---------- 4. Theme toggle (dark is the default; your choice is remembered) ---------- */
// Light mode lays a pale veil over the same background image.
function applyTheme(theme) {
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  themeToggle.textContent = theme === "light" ? "Dark mode" : "Light mode";
  themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}
var savedTheme = null;
try { savedTheme = localStorage.getItem("theme-blue"); } catch (e) { /* storage may be blocked */ }
applyTheme(savedTheme === "light" ? "light" : "dark");

themeToggle.addEventListener("click", function () {
  var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("theme-blue", next); } catch (e) { /* ignore */ }
});

/* ---------- 5. Cinematic background (decoration only) ---------- */
try {
  var bg = document.getElementById("bg");
  var canvas = document.getElementById("fx");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var cw = 0, ch = 0;
  var particles = [];
  var streaks = [];
  var nextStreak = 0;
  var mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
  var running = false;

  // one pre-drawn soft glow that every particle re-uses (cheap to draw)
  var sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  var sctx = sprite.getContext("2d");
  var grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(207,226,251,1)");
  grad.addColorStop(0.25, "rgba(91,155,240,.7)");
  grad.addColorStop(1, "rgba(36,107,206,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 32, 32);

  var resizeCanvas = function () {
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(26, Math.min(70, Math.round(cw * ch / 24000)));
    particles = [];
    for (var i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * cw, y: Math.random() * ch,
        r: 3 + Math.random() * 9,
        vx: (Math.random() - 0.5) * 8, vy: -(2 + Math.random() * 9),   // pixels per second
        a: 0.18 + Math.random() * 0.5, ph: Math.random() * 6.28
      });
    }
  };

  var last = 0;
  var frame = function (t) {
    if (!running) return;
    var dt = Math.min((t - last) / 1000, 0.05); last = t;

    // smooth cursor parallax
    smoothX += (mouseX - smoothX) * 0.05;
    smoothY += (mouseY - smoothY) * 0.05;
    bg.style.setProperty("--px", smoothX.toFixed(3));
    bg.style.setProperty("--py", smoothY.toFixed(3));

    ctx.clearRect(0, 0, cw, ch);
    var ox = smoothX * -10, oy = smoothY * -7;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.ph += dt * 0.9;
      if (p.y < -20) { p.y = ch + 20; p.x = Math.random() * cw; }
      if (p.x < -20) p.x = cw + 20; if (p.x > cw + 20) p.x = -20;
      ctx.globalAlpha = p.a * (0.65 + 0.35 * Math.sin(p.ph));
      ctx.drawImage(sprite, p.x + ox - p.r, p.y + oy - p.r, p.r * 2, p.r * 2);
    }

    // an occasional faint light streak
    if (t > nextStreak) {
      streaks.push({ x: Math.random() * cw * 0.7 - 80, y: ch * (0.45 + Math.random() * 0.6), life: 0 });
      nextStreak = t + 6000 + Math.random() * 8000;
    }
    for (var s = streaks.length - 1; s >= 0; s--) {
      var st = streaks[s];
      st.life += dt;
      var prog = st.life / 1.1;
      if (prog >= 1) { streaks.splice(s, 1); continue; }
      var hx = st.x + prog * 1100 * 0.88, hy = st.y - prog * 1100 * 0.47;
      var tx = hx - 240 * 0.88, ty = hy + 240 * 0.47;
      var g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, "rgba(91,155,240,0)");
      g.addColorStop(1, "rgba(160,200,255," + (0.5 * Math.sin(prog * Math.PI)).toFixed(3) + ")");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  };

  var start = function () {
    if (running || reduceMotion) return;
    running = true; last = performance.now(); nextStreak = last + 4000;
    requestAnimationFrame(frame);
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  if (reduceMotion) {
    // draw the particles once, no movement
    ctx.clearRect(0, 0, cw, ch);
    particles.forEach(function (p) { ctx.globalAlpha = p.a * 0.7; ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); });
  } else {
    window.addEventListener("pointermove", function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; } else { start(); }
    });
    start();
  }
} catch (err) { /* background effects are optional */ }

/* ---------- 6. Intro helper and first-visit hint ---------- */
var intro = document.getElementById("intro");
if (intro) {
  // the intro removes itself when its animation ends; a click or key press skips it
  intro.addEventListener("animationend", function (e) { if (e.target === intro) intro.remove(); });
  var skipIntro = function () { intro.classList.add("intro--skip"); };
  document.addEventListener("pointerdown", skipIntro, { once: true });
  document.addEventListener("keydown", skipIntro, { once: true });
  setTimeout(function () { if (intro.parentNode) intro.remove(); }, 4500);   // safety net
}

var hintTimer = null;
function showHint() {
  if (menuOpen) return;
  menuHint.hidden = false;
  requestAnimationFrame(function () { menuHint.classList.add("is-visible"); });
  menuBtn.classList.add("is-nudge");
  hintTimer = setTimeout(hideHint, 6500);
}
function hideHint() {
  clearTimeout(hintTimer);
  menuBtn.classList.remove("is-nudge");
  if (menuHint.classList.contains("is-visible")) {
    menuHint.classList.remove("is-visible");
    setTimeout(function () { menuHint.hidden = true; }, 600);
  } else {
    menuHint.hidden = true;
  }
  try { localStorage.setItem("menu-hint-seen", "1"); } catch (e) { /* ignore */ }
}
var hintSeen = false;
try { hintSeen = localStorage.getItem("menu-hint-seen") === "1"; } catch (e) { /* ignore */ }
if (!hintSeen) setTimeout(showHint, reduceMotion ? 800 : 3200);

/* ---------- 7. Back-to-top button ---------- */
var toTop = document.getElementById("toTop");

function updateToTop() {
  toTop.hidden = window.scrollY < 500;
}
toTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", function () {
  updateActiveLink();
  updateToTop();
}, { passive: true });
updateActiveLink();
updateToTop();

/* ---------- 8. Project search + category filters (they work together) ---------- */
var projectCards = Array.prototype.slice.call(document.querySelectorAll(".project"));
var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter"));
var searchInput = document.getElementById("projectSearch");
var projectCount = document.getElementById("projectCount");
var projectEmpty = document.getElementById("projectEmpty");
var activeFilter = "all";

function updateProjects() {
  var query = searchInput.value.trim().toLowerCase();
  var shown = 0;

  projectCards.forEach(function (card) {
    var categories = card.getAttribute("data-category").split(" ");
    var matchesFilter = activeFilter === "all" || categories.indexOf(activeFilter) !== -1;
    var matchesSearch = query === "" || card.textContent.toLowerCase().indexOf(query) !== -1;
    var visible = matchesFilter && matchesSearch;
    var wasHidden = card.hidden;
    card.hidden = !visible;
    if (visible && wasHidden) {
      card.classList.remove("is-pop");
      void card.offsetWidth;
      card.classList.add("is-pop");
    }
    if (visible) shown++;
  });

  projectEmpty.hidden = shown !== 0;
  projectCount.textContent = "Showing " + shown + " of " + projectCards.length + " projects";
}

filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    activeFilter = btn.getAttribute("data-filter");
    filterButtons.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    updateProjects();
  });
});
searchInput.addEventListener("input", updateProjects);
updateProjects();

/* ---------- Shared modal helpers ---------- */
var lastFocused = null;

function openModal(modal) {
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  var closeBtn = modal.querySelector(".modal__close");
  if (closeBtn) closeBtn.focus();
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll(".modal").forEach(function (modal) {
  // Click the dark backdrop or any close button
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.hasAttribute("data-close")) closeModal(modal);
  });
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach(function (m) { if (!m.hidden) closeModal(m); });
  }
});

/* ---------- 9a. Project modal ---------- */
// Edit the text here to change what each "View Details" window shows.
var projectDetails = {
  "html-activities": {
    tag: "HTML",
    title: "HTML Activities",
    desc: "A collection of class exercises that practice the basics of HTML.",
    images: ["assets/Exercise_1.png", "assets/Exercise_2.png"],
    points: ["Headings, paragraphs, and lists", "Links and images", "Tables and forms", "Built as part of my BSIT coursework"]
  },
  "class-schedule": {
    tag: "HTML · Design",
    title: "Class Schedule",
    desc: "A weekly class schedule presented in a clean, easy-to-read table.",
    images: ["assets/Class_Schedule.jpg"],
    points: ["HTML table structure", "CSS styling for readability", "Organized by day and time"]
  },
  "coffee-menu": {
    tag: "HTML · Design",
    title: "Coffee Shop Menu",
    desc: "A coffee shop menu page that focuses on layout and typography.",
    images: ["assets/Coffe_Shop_Menu.jpg"],
    points: ["Menu sections with prices", "Consistent spacing and fonts", "Practice with CSS layout"]
  },
  "personal-creations": {
    tag: "Personal · Design",
    title: "Other Personal Creations",
    desc: "Things I make on my own to practice creativity and try new ideas.",
    images: ["assets/Personal_Creations.jpg"],
    points: ["Drawings and sketches", "Video edits", "Small design experiments"]
  },
  "portfolio-site": {
    tag: "HTML · Personal · Design",
    title: "Personal Portfolio Website",
    desc: "The website you are looking at, built to introduce myself and show my work.",
    images: ["assets/Website.png"],
    points: ["HTML5, CSS3, and JavaScript", "Responsive layout with dark mode", "Searchable and filterable projects"]
  }
};

var projectModal = document.getElementById("projectModal");

document.querySelectorAll("[data-details]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var info = projectDetails[btn.getAttribute("data-details")];
    if (!info) return;
    document.getElementById("modalTag").textContent = info.tag;
    document.getElementById("modalTitle").textContent = info.title;
    document.getElementById("modalDesc").textContent = info.desc;
    var modalImages = document.getElementById("modalImages");
    modalImages.innerHTML = "";
    modalImages.classList.toggle("modal__project-images--pair", info.images.length > 1);
    info.images.forEach(function (src, index) {
      var image = document.createElement("img");
      image.src = src;
      image.alt = "Project image " + (index + 1) + ": " + info.title;
      modalImages.appendChild(image);
    });
    var list = document.getElementById("modalList");
    list.innerHTML = "";
    info.points.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
    openModal(projectModal);
  });
});

/* ---------- 9b. Certificate preview ---------- */
// To show a real certificate, add  data-img="images/your-file.jpg"  to the matching
// <button class="cert__preview"> in index.html.
var certModal = document.getElementById("certModal");
var certWrap = document.getElementById("certImageWrap");
var certPlaceholder = certWrap.innerHTML;

document.querySelectorAll(".cert__preview").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var title = btn.getAttribute("data-cert");
    var img = btn.getAttribute("data-img");
    document.getElementById("certTitle").textContent = title;
    if (img) {
      certWrap.innerHTML = "";
      var el = document.createElement("img");
      el.src = img;
      el.alt = "Certificate: " + title;
      certWrap.appendChild(el);
    } else {
      certWrap.innerHTML = certPlaceholder;
    }
    openModal(certModal);
  });
});

/* ---------- 10. Contact form validation ---------- */
var form = document.getElementById("contactForm");
var formStatus = document.getElementById("formStatus");

function setError(field, message) {
  var box = form.querySelector('[data-error-for="' + field.id + '"]');
  box.textContent = message;
  field.classList.toggle("is-invalid", message !== "");
  field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

function validateField(field) {
  var value = field.value.trim();
  var message = "";
  if (value === "") {
    message = "This field is required.";
  } else if (field.id === "name" && value.length < 2) {
    message = "Please enter your full name.";
  } else if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    message = "Please enter a valid email address.";
  } else if (field.id === "message" && value.length < 10) {
    message = "Your message should be at least 10 characters.";
  }
  setError(field, message);
  return message === "";
}

var formFields = Array.prototype.slice.call(form.querySelectorAll(".field__input"));
formFields.forEach(function (field) {
  field.addEventListener("blur", function () { validateField(field); });
  field.addEventListener("input", function () { if (field.classList.contains("is-invalid")) validateField(field); });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  formStatus.className = "form-status";
  formStatus.textContent = "";

  var allGood = true;
  var firstBad = null;
  formFields.forEach(function (field) {
    if (!validateField(field)) {
      allGood = false;
      if (!firstBad) firstBad = field;
    }
  });

  if (!allGood) {
    formStatus.textContent = "Please fix the highlighted fields and try again.";
    firstBad.focus();
    return;
  }

  // No mail service is connected yet, so this shows feedback without sending anything.
  var firstName = document.getElementById("name").value.trim().split(" ")[0];
  formStatus.className = "form-status is-success";
  formStatus.textContent = "Thank you, " + firstName + "! Your message passed validation. (This form is not connected to an email service yet.)";
  form.reset();
  formFields.forEach(function (f) { setError(f, ""); });
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- 11. Profile image fallback ---------- */
// If profile-cutout.png is missing, show initials instead of a broken image icon.
var profileImg = document.getElementById("profileImg");
profileImg.addEventListener("error", function () {
  var box = document.createElement("div");
  box.className = "fallback";
  box.textContent = "SF";
  profileImg.replaceWith(box);
});


/* ---------- 12. Smooth scroll-reveal motion ---------- */
(function () {
  try {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var targets = document.querySelectorAll(
      ".sec .eyebrow, .sec-title, .projects__head, .projects__tools, " +
      ".info, .interest, .goal, .skill, .project, .cert, .field, .contact .btn, " +
      ".sec p, .sec h3, .sec label, .sec .field__input, .sec .filter, .sec .cert__preview, " +
      ".sec .project__image, .sec .cert__image, .footer__text > *, .shark:not(.shark--hero)"
    );
    var seen = new Map();
    targets.forEach(function (el) {
      if (el.closest(".hero, .menu, .modal, .intro, .menu-btn, .menu-hint")) return;
      var parent = el.parentElement;
      var n = seen.get(parent) || 0;
      seen.set(parent, n + 1);
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", (Math.min(n, 6) * 0.09).toFixed(2) + "s");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    document.documentElement.classList.add("js-anim");
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  } catch (err) {
    document.documentElement.classList.remove("js-anim");
  }
})();
