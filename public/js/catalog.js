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
        return window.silhouetteFor(i);
      },
      formatPrice(p) {
        return window.formatPrice(p);
      },
      async loadProducts() {
        this.loading = true;
        this.error = null;
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('сервер ответил ' + res.status);
          const data = await res.json();
          const real = data.products || [];
          this.products = real.length ? real : window.DEMO_PRODUCTS;
          this.isDemo = !real.length;
        } catch (err) {
          // МойСклад ещё не настроен или недоступен — показываем демо-товары,
          // а не голую ошибку, чтобы раздел не выглядел пустым/сломанным.
          this.error = err.message;
          this.products = window.DEMO_PRODUCTS;
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
