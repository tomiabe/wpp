(function () {
  "use strict";

  // Any link pointing at the Zenfoody store opens in an in-site panel.
  // Without JavaScript the links still work and open Zenfoody in a new tab.
  var ORDER_HOST = "whatspoppinpopcorn.zenfoody.com";
  // Always start at the store root: deep links skip Zenfoody's session setup and show a blank page.
  var ORDER_URL = "https://" + ORDER_HOST + "/";

  var modal = null;
  var frame = null;
  var loading = null;
  var slow = null;
  var lastFocus = null;
  var slowTimer = null;

  function isOrderLink(a) {
    if (!a || !a.href) {
      return false;
    }
    try {
      return new URL(a.href, window.location.href).hostname === ORDER_HOST;
    } catch (e) {
      return false;
    }
  }

  function build() {
    modal = document.createElement("div");
    modal.className = "order-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Order online");
    modal.innerHTML =
      '<div class="order-modal__dialog">' +
      '<div class="order-modal__bar">' +
      '<p class="order-modal__title">Order Online</p>' +
      '<div class="order-modal__actions">' +
      '<a class="order-modal__newtab" href="' + ORDER_URL + '" target="_blank" rel="noopener">Open in new tab</a>' +
      '<button type="button" class="order-modal__close" aria-label="Close ordering">Close &#10005;</button>' +
      "</div></div>" +
      '<div class="order-modal__body">' +
      '<iframe class="order-modal__frame" title="Order What\'s Poppin Popcorn online" allow="payment *" referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
      '<div class="order-modal__loading"><div class="order-modal__spinner" aria-hidden="true"></div>' +
      "<span>Loading our menu...</span>" +
      '<p class="order-modal__slow">Taking a while? <a href="' + ORDER_URL + '" target="_blank" rel="noopener">Open the order page in a new tab</a>.</p>' +
      "</div></div></div>";
    document.body.appendChild(modal);

    frame = modal.querySelector(".order-modal__frame");
    loading = modal.querySelector(".order-modal__loading");
    slow = modal.querySelector(".order-modal__slow");

    frame.addEventListener("load", function () {
      if (frame.getAttribute("src")) {
        loading.classList.add("is-done");
        clearTimeout(slowTimer);
      }
    });

    modal.querySelector(".order-modal__close").addEventListener("click", close);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        close();
      }
    });
  }

  function open() {
    if (!modal) {
      build();
    }
    lastFocus = document.activeElement;
    loading.classList.remove("is-done");
    slow.classList.remove("is-shown");
    if (!frame.getAttribute("src")) {
      frame.setAttribute("src", ORDER_URL);
    } else {
      // Already loaded earlier: keep the customer's cart and place.
      loading.classList.add("is-done");
    }
    clearTimeout(slowTimer);
    slowTimer = setTimeout(function () {
      slow.classList.add("is-shown");
    }, 8000);

    modal.classList.add("is-open");
    document.body.classList.add("order-modal-open");
    requestAnimationFrame(function () {
      modal.classList.add("is-visible");
    });
    modal.querySelector(".order-modal__close").focus();
  }

  function close() {
    if (!modal) {
      return;
    }
    modal.classList.remove("is-visible");
    document.body.classList.remove("order-modal-open");
    clearTimeout(slowTimer);
    window.setTimeout(function () {
      modal.classList.remove("is-open");
    }, 200);
    if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    var link = event.target.closest ? event.target.closest("a") : null;
    if (isOrderLink(link) && !link.closest(".order-modal")) {
      event.preventDefault();
      open();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!modal || !modal.classList.contains("is-open")) {
      return;
    }
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key === "Tab") {
      // Keep keyboard focus on the close and new-tab controls while the panel is open.
      var controls = modal.querySelectorAll(".order-modal__newtab, .order-modal__close");
      var first = controls[0];
      var last = controls[controls.length - 1];
      if (document.activeElement === frame || !modal.contains(document.activeElement)) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
