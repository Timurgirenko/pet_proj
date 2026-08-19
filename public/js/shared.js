// Показываются, пока в МойСклад не подключены реальные товары —
// чтобы каталог не выглядел пустым. Как только API отдаст настоящие
// товары, эти карточки автоматически заменятся.
window.DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Платье-рубашка',
    fabric: 'Вискоза, бордовый',
    price: 5200,
    category: 'Платья'
  },
  {
    id: 'demo-2',
    name: 'Костюм с жакетом',
    fabric: 'Костюмная ткань, чёрный',
    price: 8900,
    category: 'Костюмы'
  },
  {
    id: 'demo-3',
    name: 'Шуба из эко-меха',
    fabric: 'Эко-мех, карамель',
    price: 15400,
    category: 'Шубы и дублёнки'
  }
];

window.SILHOUETTES = [
  { d: 'M30 10 L50 4 L70 10 L74 30 L64 34 L62 110 L38 110 L36 34 L26 30 Z', color: 'var(--indigo)' },
  { d: 'M28 8 L72 8 L78 40 L64 116 L36 116 L22 40 Z', color: 'var(--rose)' },
  { d: 'M35 6 L65 6 L65 116 L35 116 Z M65 20 L84 24 L80 60 L65 56', color: 'var(--olive)' },
  { d: 'M20 20 L50 6 L80 20 L80 46 L64 40 L64 116 L36 116 L36 40 L20 46 Z', color: 'var(--ink)' }
];

window.TELEGRAM_USERNAME = 'your_shop_username'; // замените на реальный ник магазина

window.formatPrice = function (p) {
  if (p === null || p === undefined) return 'цена по запросу';
  return p.toLocaleString('ru-RU') + ' ₽';
};

window.silhouetteFor = function (i) {
  return window.SILHOUETTES[i % window.SILHOUETTES.length];
};
