/* ============================================
   Blue Season Camiguin — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    function updateNavbar() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
  }

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay');

  function openMenu() {
    navbar.classList.add('menu-open');
    navToggle.classList.add('active');
    navMenu.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navbar.classList.remove('menu-open');
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when overlay is tapped
    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Scroll reveal animation ---------- */
  const revealElements = document.querySelectorAll('.glass-card, .feature-card, .site-card, .course-card, .site-detail, .accommodation-grid, .contact-method');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      revealObserver.observe(el);
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Disable selection / copy / paste / context menu ---------- */
  function isFormField(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  document.addEventListener('contextmenu', function (e) {
    if (!isFormField(e.target)) e.preventDefault();
  });

  document.addEventListener('selectstart', function (e) {
    if (!isFormField(e.target)) e.preventDefault();
  });

  document.addEventListener('copy', function (e) {
    if (!isFormField(e.target)) e.preventDefault();
  });

  document.addEventListener('cut', function (e) {
    if (!isFormField(e.target)) e.preventDefault();
  });

  document.addEventListener('dragstart', function (e) {
    if (!isFormField(e.target)) e.preventDefault();
  });

  /* ---------- Contact form (basic) ---------- */
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(contactForm);
      var name = formData.get('name');
      // Build WhatsApp message from form data
      var message = 'Hello Blue Season! My name is ' + (name || 'Guest') + '. ';
      var interest = formData.get('interest');
      if (interest) message += 'I am interested in: ' + interest + '. ';
      var userMessage = formData.get('message');
      if (userMessage) message += userMessage;
      var waUrl = 'https://wa.me/639498765618?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank');
    });
  }

  /* ---------- Promo modal (limited-time event) ---------- */
  var promoModal = document.getElementById('promoModal');
  if (promoModal) {
    var PROMO_KEY = 'bs_promo_coral2026';
    var PROMO_END = new Date('2026-07-01T00:00:00+08:00'); // Event runs through June 2026 (PH time)
    var promoDismissed = false;
    try { promoDismissed = sessionStorage.getItem(PROMO_KEY) === '1'; } catch (e) {}

    function rememberPromo() {
      try { sessionStorage.setItem(PROMO_KEY, '1'); } catch (e) {}
    }

    function openPromo() {
      promoModal.classList.add('open');
      promoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closePromo() {
      promoModal.classList.remove('open');
      promoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      rememberPromo();
    }

    // Show once per browser session — pops up again next time the visitor reopens the site
    // (sessionStorage clears when the tab/browser closes; still auto-stops after the event ends)
    if (new Date() < PROMO_END && !promoDismissed) {
      setTimeout(openPromo, 1500);
    }

    // Close via overlay or close button
    promoModal.querySelectorAll('[data-promo-close]').forEach(function (el) {
      el.addEventListener('click', closePromo);
    });

    // Following a link to the details page also counts as "seen"
    promoModal.querySelectorAll('a[href]').forEach(function (el) {
      el.addEventListener('click', rememberPromo);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && promoModal.classList.contains('open')) {
        closePromo();
      }
    });
  }

});

/* ---------- Style for revealed elements ---------- */
var style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
