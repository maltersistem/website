(() => {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NAV_HEIGHT = 72;

  // ===== Mobile Navigation =====
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navOverlay = document.getElementById('navOverlay');
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.navbar__link');

  function openMenu() {
    navToggle.classList.add('active');
    navMenu.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.contains('active') ? closeMenu() : openMenu();
    });
  }

  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      closeMenu();
    });
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });

  // ===== Navbar Scroll Effect =====
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrollY = window.scrollY;

        if (navbar) {
          if (scrollY > 100) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }

        // Hero parallax
        if (!prefersReducedMotion) {
          var heroBg = document.querySelector('.hero__bg');
          if (heroBg && scrollY < window.innerHeight) {
            heroBg.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== Scroll Reveal Animations =====
  try {
    var revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0 && !prefersReducedMotion) {
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.dataset.delay || 0;
            setTimeout(function() {
              entry.target.classList.add('active');
            }, parseInt(delay));
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(function(el) { revealObserver.observe(el); });
    } else {
      revealElements.forEach(function(el) { el.classList.add('active'); });
    }
  } catch (e) {
    console.warn('Reveal error:', e);
  }

  // ===== Counter Animation =====
  try {
    var counters = document.querySelectorAll('.counter');

    function animateCounter(el) {
      var target = parseInt(el.dataset.target);
      var duration = 2000;
      var startTime = performance.now();

      function update(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }

    if (counters.length > 0) {
      if (prefersReducedMotion) {
        counters.forEach(function(c) { c.textContent = c.dataset.target; });
      } else {
        var counterObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });

        counters.forEach(function(c) { counterObserver.observe(c); });
      }
    }
  } catch (e) {
    console.warn('Counter error:', e);
  }

  // ===== Active Nav Link Highlighting =====
  try {
    var sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
      var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function(link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '-' + NAV_HEIGHT + 'px 0px -30% 0px'
      });

      sections.forEach(function(section) { sectionObserver.observe(section); });
    }
  } catch (e) {
    console.warn('Section observer error:', e);
  }

  // ===== Gallery Carousel =====
  try {
    var carouselTrack = document.getElementById('carouselTrack');
    var carouselDots = document.getElementById('carouselDots');
    var carouselPrev = document.getElementById('carouselPrev');
    var carouselNext = document.getElementById('carouselNext');
    var galleryFilters = document.getElementById('galleryFilters');
    var galleryData = [];
    var currentFilter = 'all';
    var carouselPos = 0;
    var autoplayTimer = null;
    var AUTOPLAY_INTERVAL = 4000;

    var VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
    var PLAY_ICON = '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';

    function isVideo(src) {
      return VIDEO_EXTENSIONS.some(function(ext) { return src.toLowerCase().endsWith(ext); });
    }

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function getFilteredData() {
      if (currentFilter === 'all') return galleryData;
      return galleryData.filter(function(item) { return item.category === currentFilter; });
    }

    function renderCarousel(filter) {
      currentFilter = filter;
      carouselPos = 0;
      var items = getFilteredData();

      if (items.length === 0) {
        carouselTrack.innerHTML = '<div class="gallery__empty"><p>Nema slika u ovoj kategoriji.</p></div>';
        carouselDots.innerHTML = '';
        return;
      }

      carouselTrack.innerHTML = items.map(function(item, i) {
        var video = isVideo(item.src);
        var thumb = video ? (item.thumbnail || '') : item.src;
        return '<figure class="gallery__item" data-index="' + galleryData.indexOf(item) + '">' +
          '<div class="gallery__image">' +
            (thumb ? '<img src="' + thumb + '" alt="' + item.title + '" loading="lazy" decoding="async">' : '') +
          '</div>' +
          (video ? '<div class="gallery__play" aria-hidden="true">' + PLAY_ICON + '</div>' : '') +
          '<figcaption class="gallery__caption"><h3>' + item.title + '</h3>' +
            (item.description ? '<p>' + item.description + '</p>' : '') +
          '</figcaption></figure>';
      }).join('');

      updateDots(items.length);
      updateCarouselPosition();
      startAutoplay();
    }

    function updateDots(totalItems) {
      var perView = getSlidesPerView();
      var totalPages = Math.max(1, Math.ceil(totalItems / perView));
      var html = '';
      for (var i = 0; i < totalPages; i++) {
        html += '<button class="carousel__dot' + (i === 0 ? ' active' : '') + '" data-page="' + i + '"></button>';
      }
      carouselDots.innerHTML = html;
    }

    function updateCarouselPosition() {
      var perView = getSlidesPerView();
      var percent = carouselPos * (100 / perView);
      carouselTrack.style.transform = 'translateX(-' + percent + '%)';

      // Update dots
      var currentPage = Math.floor(carouselPos / perView);
      carouselDots.querySelectorAll('.carousel__dot').forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentPage);
      });
    }

    function slideNext() {
      var items = getFilteredData();
      var perView = getSlidesPerView();
      var maxPos = Math.max(0, items.length - perView);
      carouselPos = carouselPos >= maxPos ? 0 : carouselPos + 1;
      updateCarouselPosition();
    }

    function slidePrev() {
      var items = getFilteredData();
      var perView = getSlidesPerView();
      var maxPos = Math.max(0, items.length - perView);
      carouselPos = carouselPos <= 0 ? maxPos : carouselPos - 1;
      updateCarouselPosition();
    }

    function startAutoplay() {
      stopAutoplay();
      if (!prefersReducedMotion) {
        autoplayTimer = setInterval(slideNext, AUTOPLAY_INTERVAL);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Arrow clicks
    if (carouselNext) carouselNext.addEventListener('click', function() { slideNext(); startAutoplay(); });
    if (carouselPrev) carouselPrev.addEventListener('click', function() { slidePrev(); startAutoplay(); });

    // Dot clicks
    if (carouselDots) {
      carouselDots.addEventListener('click', function(e) {
        var dot = e.target.closest('.carousel__dot');
        if (!dot) return;
        var page = parseInt(dot.dataset.page);
        carouselPos = page * getSlidesPerView();
        updateCarouselPosition();
        startAutoplay();
      });
    }

    // Pause on hover
    var carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
    }

    // Recalculate on resize
    window.addEventListener('resize', function() {
      var items = getFilteredData();
      var perView = getSlidesPerView();
      var maxPos = Math.max(0, items.length - perView);
      if (carouselPos > maxPos) carouselPos = maxPos;
      updateDots(items.length);
      updateCarouselPosition();
    });

    // Filters
    function buildFilters(data) {
      var categories = [];
      data.forEach(function(item) {
        if (item.category && categories.indexOf(item.category) === -1) {
          categories.push(item.category);
        }
      });

      var labels = {
        malterisanje: 'Malterisanje', moleraj: 'Moleraj', grubi: 'Grubi radovi', fasade: 'Fasade', sanacije: 'Sanacije',
        dekorativne: 'Dekorativne', priprema: 'Priprema', ostalo: 'Ostalo'
      };

      var html = '<button class="gallery__filter active" data-filter="all">Sve</button>';
      categories.forEach(function(cat) {
        html += '<button class="gallery__filter" data-filter="' + cat + '">' + (labels[cat] || cat) + '</button>';
      });
      galleryFilters.innerHTML = html;

      galleryFilters.addEventListener('click', function(e) {
        var btn = e.target.closest('.gallery__filter');
        if (!btn) return;
        galleryFilters.querySelectorAll('.gallery__filter').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderCarousel(btn.dataset.filter);
      });
    }

    // Lightbox
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxVideo = document.getElementById('lightboxVideo');
    var lightboxInfo = document.getElementById('lightboxInfo');
    var lightboxCounter = document.getElementById('lightboxCounter');
    var lightboxIndex = 0;
    var lightboxItems = [];

    function stopVideo() {
      if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.removeAttribute('src'); lightboxVideo.hidden = true; }
    }

    function showLightbox(index) {
      lightboxItems = getFilteredData();
      lightboxIndex = index;
      updateLightbox();
      lightbox.hidden = false;
      stopAutoplay();
      requestAnimationFrame(function() { lightbox.classList.add('visible'); });
      document.body.style.overflow = 'hidden';
    }

    function hideLightbox() {
      stopVideo();
      lightbox.classList.remove('visible');
      setTimeout(function() { lightbox.hidden = true; document.body.style.overflow = ''; startAutoplay(); }, 350);
    }

    function updateLightbox() {
      var item = lightboxItems[lightboxIndex];
      if (!item) return;
      stopVideo();
      if (isVideo(item.src)) {
        lightboxImg.hidden = true; lightboxVideo.hidden = false; lightboxVideo.src = item.src;
      } else {
        lightboxImg.hidden = false; lightboxImg.src = item.src; lightboxImg.alt = item.title;
      }
      lightboxInfo.innerHTML = '<h3>' + item.title + '</h3>' + (item.description ? '<p>' + item.description + '</p>' : '');
      lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxItems.length;
    }

    if (carouselTrack) {
      carouselTrack.addEventListener('click', function(e) {
        var item = e.target.closest('.gallery__item');
        if (!item) return;
        var globalIndex = parseInt(item.dataset.index);
        var filtered = getFilteredData();
        var visibleIndex = filtered.indexOf(galleryData[globalIndex]);
        showLightbox(visibleIndex >= 0 ? visibleIndex : 0);
      });
    }

    if (lightbox) {
      lightbox.querySelector('.lightbox__close').addEventListener('click', hideLightbox);
      lightbox.querySelector('.lightbox__prev').addEventListener('click', function() {
        lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; updateLightbox();
      });
      lightbox.querySelector('.lightbox__next').addEventListener('click', function() {
        lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; updateLightbox();
      });
      lightbox.addEventListener('click', function(e) { if (e.target === lightbox) hideLightbox(); });
    }

    document.addEventListener('keydown', function(e) {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === 'Escape') hideLightbox();
      if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; updateLightbox(); }
      if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; updateLightbox(); }
    });

    // Load gallery
    fetch('img/gallery/gallery.json')
      .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function(data) {
        galleryData = data;
        if (data.length === 0) {
          carouselTrack.innerHTML = '<div class="gallery__empty"><p>Galerija je u pripremi.</p></div>';
          return;
        }
        buildFilters(data);
        renderCarousel('all');
      })
      .catch(function() {
        if (galleryGrid) galleryGrid.innerHTML = '<div class="gallery__empty"><p>Galerija je u pripremi.</p></div>';
      });

  } catch (e) {
    console.warn('Gallery error:', e);
  }

  // ===== Lazy load Google Maps =====
  try {
    var mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
      var mapObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          var iframe = mapContainer.querySelector('iframe[data-src]');
          if (iframe) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
          }
          mapObserver.disconnect();
        }
      }, { rootMargin: '200px 0px' });
      mapObserver.observe(mapContainer);
    }
  } catch (e) {
    console.warn('Map lazy load error:', e);
  }

  // Initial scroll check
  onScroll();
})();
