const SILHOUETTES = [
  { d: 'M30 10 L50 4 L70 10 L74 30 L64 34 L62 110 L38 110 L36 34 L26 30 Z', color: 'var(--indigo)' },
  { d: 'M28 8 L72 8 L78 40 L64 116 L36 116 L22 40 Z', color: 'var(--rose)' },
  { d: 'M35 6 L65 6 L65 116 L35 116 Z M65 20 L84 24 L80 60 L65 56', color: 'var(--olive)' },
  { d: 'M20 20 L50 6 L80 20 L80 46 L64 40 L64 116 L36 116 L36 40 L20 46 Z', color: 'var(--ink)' }
];

// Замените на настоящий юзернейм магазина в Telegram
const TELEGRAM_USERNAME = 'your_shop_username';

// Показываются, пока в МойСклад не подключены реальные товары —
// чтобы каталог не выглядел пустым. Как только API отдаст настоящие
// товары, эти карточки автоматически заменятся.
const DEMO_PRODUCTS = [
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

function mountCatalogApp() {
  const { createApp } = Vue;

  const app = createApp({
    data() {
      return {
        products: [],
        loading: true,
        error: null,
        isDemo: false,
        selectedCategory: 'all',
        searchQuery: '',
        searchOpen: false
      };
    },
    computed: {
      statusText() {
        if (this.loading) return 'Загружаем товары из МойСклад…';
        if (!this.products.length) return 'Товары не найдены.';
        return '';
      },
      categories() {
        const set = new Set(this.products.map((p) => p.category || 'Без категории'));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
      },
      filteredProducts() {
        const query = this.searchQuery.trim().toLowerCase();
        return this.products.filter((p) => {
          const matchesCategory =
            this.selectedCategory === 'all' || (p.category || 'Без категории') === this.selectedCategory;
          const matchesQuery =
            !query ||
            p.name.toLowerCase().includes(query) ||
            (p.fabric || '').toLowerCase().includes(query);
          return matchesCategory && matchesQuery;
        });
      }
    },
    methods: {
      pad(n) {
        return String(n).padStart(2, '0');
      },
      silhouette(i) {
        return SILHOUETTES[i % SILHOUETTES.length];
      },
      formatPrice(p) {
        if (p === null || p === undefined) return 'цена по запросу';
        return p.toLocaleString('ru-RU') + ' ₽';
      },
      orderLink(p) {
        const text = encodeURIComponent('Здравствуйте! Хочу заказать: ' + p.name);
        return 'https://t.me/' + TELEGRAM_USERNAME + '?text=' + text;
      },
      async loadProducts() {
        this.loading = true;
        this.error = null;
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('сервер ответил ' + res.status);
          const data = await res.json();
          const real = data.products || [];
          this.products = real.length ? real : DEMO_PRODUCTS;
          this.isDemo = !real.length;
        } catch (err) {
          // МойСклад ещё не настроен или недоступен — показываем демо-товары,
          // а не голую ошибку, чтобы раздел не выглядел пустым/сломанным.
          this.error = err.message;
          this.products = DEMO_PRODUCTS;
          this.isDemo = true;
        } finally {
          this.loading = false;
        }
      }
    },
    mounted() {
      this.loadProducts().then(() => {
        document.dispatchEvent(new Event('catalog:updated'));
      });
    }
  });

  window.__catalogApp = app.mount('#catalog-app');
}

document.addEventListener('sections:loaded', mountCatalogApp);
