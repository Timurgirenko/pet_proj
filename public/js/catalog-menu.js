function initCatalogMenu() {
  const overlay = document.getElementById('catalogMenuOverlay');
  const panel = document.getElementById('catalogMenu');
  const closeBtn = document.getElementById('catalogMenuClose');
  const sectionToggle = document.getElementById('catalogMenuToggle');
  const toggleIcon = document.getElementById('catalogMenuToggleIcon');
  const list = document.getElementById('catalogMenuList');
  const countEl = document.getElementById('catalogMenuCount');
  if (!overlay || !panel || !list) return;

  function closeMobileNavIfOpen() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
  }

  function updateCount() {
    if (!countEl) return;
    const app = window.__catalogApp;
    const n = app ? app.filteredProducts.length : 0;
    countEl.textContent = '(' + n + ')';
  }

  // Если товары из МойСклад уже загружены и у них есть реальные категории —
  // подменяем список-заглушку на настоящие категории магазина.
  function refreshCategories() {
    const app = window.__catalogApp;
    if (!app || !app.categories || !app.categories.length) return;

    list.innerHTML = '';
    const allLi = document.createElement('li');
    allLi.innerHTML = '<a href="#catalog" data-category="all">Все товары</a>';
    list.appendChild(allLi);

    app.categories.forEach(function (cat) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#catalog';
      a.setAttribute('data-category', cat);
      a.textContent = cat;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function openMenu() {
    closeMobileNavIfOpen();
    refreshCategories();
    updateCount();
    overlay.classList.add('open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  // Любая ссылка "Каталог" на странице (в шапке, мобильном меню, кнопке в hero)
  // открывает эту панель вместо обычного перехода по якорю.
  document.querySelectorAll('a[href="#catalog"]').forEach(function (link) {
    if (link.closest('#catalogMenu')) return; // ссылки внутри самой панели — отдельная логика
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openMenu();
    });
  });

  list.addEventListener('click', function (e) {
    const link = e.target.closest('a[data-category]');
    if (!link) return;
    e.preventDefault();
    const category = link.getAttribute('data-category');
    const app = window.__catalogApp;
    if (app) {
      app.selectedCategory = category === 'all' || category === 'Все товары' ? 'all' : category;
    }
    closeMenu();
    const target = document.getElementById('catalog');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  if (sectionToggle) {
    sectionToggle.addEventListener('click', function () {
      const collapsed = list.classList.toggle('collapsed');
      toggleIcon.textContent = collapsed ? '+' : '−';
      sectionToggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }
  document.addEventListener('catalog:updated', function () {
    if (panel.classList.contains('open')) {
      refreshCategories();
      updateCount();
    }
  });
}

document.addEventListener('sections:loaded', initCatalogMenu);
