// Makes "back to gallery / back to portfolio" links use real browser
// history navigation when possible, instead of a fresh page load.
// A plain <a href="gallery.html"> always starts that page at the top;
// history.back() lets the browser restore the scroll position you were
// at before you clicked into the project (same-site navigation only).
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-back-link]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var cameFromSite = false;
      try {
        cameFromSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
      } catch (err) {
        cameFromSite = false;
      }
      if (window.history.length > 1 && cameFromSite) {
        e.preventDefault();
        window.history.back();
      }
      // otherwise: no usable history (direct link/new tab) -- let the
      // normal href navigation happen as a fallback
    });
  });
});
