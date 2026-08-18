const SILHOUETTES = [
  { d: 'M30 10 L50 4 L70 10 L74 30 L64 34 L62 110 L38 110 L36 34 L26 30 Z', color: 'var(--indigo)' },
  { d: 'M28 8 L72 8 L78 40 L64 116 L36 116 L22 40 Z', color: 'var(--rose)' },
  { d: 'M35 6 L65 6 L65 116 L35 116 Z M65 20 L84 24 L80 60 L65 56', color: 'var(--olive)' },
  { d: 'M20 20 L50 6 L80 20 L80 46 L64 40 L64 116 L36 116 L36 40 L20 46 Z', color: 'var(--ink)' }
];

// Замените на настоящий юзернейм магазина в Telegram
const TELEGRAM_USERNAME = 'your_shop_username';

function mountCatalogApp() {
  const { createApp } = Vue;

  const app = createApp({
    data() {
      return {
        products: [],
        loading: true,
        error: null,
        selectedCategory: 'all',
        searchQuery: '',
        searchOpen: false
      };
    },
    computed: {
      statusText() {
        if (this.error) return 'Не удалось загрузить товары: ' + this.error;
        if (this.loading) return 'Загружаем товары из МойСклад…';
        if (!this.products.length) return 'Товары пока не загружены. Проверьте настройки МойСклад в .env на сервере.';
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
          this.products = data.products || [];
        } catch (err) {
          this.error = err.message;
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
