(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mainNav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var toTop = document.getElementById("to-top");
  if (toTop) {
    var toggleToTop = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", toggleToTop, { passive: true });
    toggleToTop();
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  var slides = document.querySelectorAll(".hero__slide");
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
    };
    var cycle = function () {
      current = (current + 1) % slides.length;
      showSlide(current);
    };
    var paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!paused) {
      window.setInterval(cycle, 6000);
    }
  }

  var storySlides = document.querySelectorAll(".story__media-slide");
  if (storySlides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var storyIndex = 0;
    window.setInterval(function () {
      storySlides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === (storyIndex + 1) % storySlides.length);
      });
      storyIndex = (storyIndex + 1) % storySlides.length;
    }, 5000);
  }

  var pills = document.querySelectorAll(".filter-pill");
  var cards = document.querySelectorAll("#flavor-grid .flavor-card");

  if (pills.length && cards.length) {
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) {
          p.classList.remove("is-active");
          p.setAttribute("aria-pressed", "false");
        });
        pill.classList.add("is-active");
        pill.setAttribute("aria-pressed", "true");
        var filter = pill.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  var items = document.querySelectorAll(".accordion__item");
  items.forEach(function (item) {
    var trigger = item.querySelector(".accordion__trigger");
    if (!trigger) {
      return;
    }
    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      items.forEach(function (other) {
        other.classList.remove("is-open");
        var otherTrigger = other.querySelector(".accordion__trigger");
        if (otherTrigger) {
          otherTrigger.setAttribute("aria-expanded", "false");
        }
      });
      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (link) {
      var hash = link.getAttribute("href");
      return hash && hash.charAt(0) === "#" ? document.querySelector(hash) : null;
    })
    .filter(Boolean);

  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---- Order overlay ---- */
  var overlay = document.getElementById("order-overlay");
  var overlayFrame = document.getElementById("order-overlay-frame");
  var overlayClose = document.getElementById("order-overlay-close");
  var overlayLoading = document.getElementById("order-overlay-loading");
  var orderSrc = "https://whatspoppinpopcorn.zenfoody.com";
  var frameReady = false;
  var revealTimer = null;

  function revealOrder() {
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = null;
    }
    if (overlayLoading) overlayLoading.classList.add("is-hidden");
    if (overlayFrame) overlayFrame.classList.add("is-loaded");
  }

  function openOrder(e) {
    e.preventDefault();
    if (!overlay) return;
    if (!frameReady) {
      frameReady = true;
      overlayFrame.src = orderSrc;
      // Zenfoody loads many third-party resources and its "load" event can
      // take a long time (or never fire), so reveal the embedded app on a
      // short fixed delay as well as on load.
      revealTimer = window.setTimeout(revealOrder, 3000);
    } else {
      revealOrder();
    }
    overlay.hidden = false;
    document.body.classList.add("overlay-open");
    overlayClose.focus();
  }

  function closeOrder() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("overlay-open");
  }

  if (overlayFrame) {
    overlayFrame.addEventListener("load", revealOrder);
  }

  document.querySelectorAll(".open-order").forEach(function (link) {
    link.addEventListener("click", openOrder);
  });

  if (overlayClose) {
    overlayClose.addEventListener("click", closeOrder);
  }

  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOrder();
    });
    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOrder();
    });
  }

  var form = document.getElementById("event-form");
  var status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = "Thanks! Your request has been received. We will get back to you within one business day.";
      status.classList.add("is-success");
      status.classList.remove("is-error");
      form.reset();
    });
  }
})();
