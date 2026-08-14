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

  /* ---------- Gallery lightbox ---------- */
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
  var lightbox = document.getElementById('lightbox');
  if (galleryImgs.length && lightbox) {
    var lbImg = lightbox.querySelector('.lightbox-img');
    var current = 0;

    function showPhoto(i) {
      current = (i + galleryImgs.length) % galleryImgs.length;
      var img = galleryImgs[current];
      lbImg.src = img.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt || '';
    }

    function openLightbox(i) {
      showPhoto(i);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    galleryImgs.forEach(function (img, i) {
      var trigger = img.closest('.gallery-item') || img;
      trigger.addEventListener('click', function () { openLightbox(i); });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { showPhoto(current - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { showPhoto(current + 1); });

    // Close when the dark backdrop (not the image or buttons) is clicked
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPhoto(current - 1);
      else if (e.key === 'ArrowRight') showPhoto(current + 1);
    });
  }

});

/* ---------- Style for revealed elements ---------- */
var style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);
