function initMobileMenu() {
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mobileNav');
  var overlay = document.getElementById('mobileOverlay');
  if (!burger || !nav || !overlay) return;

  function closeMenu() {
    nav.classList.remove('open');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    var isOpen = nav.classList.toggle('open');
    overlay.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  }

  burger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
}

document.addEventListener('sections:loaded', initMobileMenu);
