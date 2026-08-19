function mountProductApp() {
  const { createApp } = Vue;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  createApp({
    data() {
      return {
        product: null,
        loading: true,
        selectedSize: 'M',
        qty: 1,
        justAdded: false,
        sizes: ['XS', 'S', 'M', 'L'],
        open: {
          description: true,
          sizes: false,
          delivery: false
        }
      };
    },
    computed: {
      art() {
        // Индекс силуэта берём из id товара, чтобы одна и та же карточка
        // всегда показывала одну и ту же иллюстрацию
        const key = String(this.product && this.product.id);
        let hash = 0;
        for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % window.SILHOUETTES.length;
        return window.silhouetteFor(hash);
      },
      orderLink() {
        if (!this.product) return '#';
        const text = encodeURIComponent(
          'Здравствуйте! Хочу заказать: ' + this.product.name +
          ', размер ' + this.selectedSize +
          ', количество: ' + this.qty
        );
        return 'https://t.me/' + window.TELEGRAM_USERNAME + '?text=' + text;
      }
    },
    methods: {
      formatPrice(p) {
        return window.formatPrice(p);
      },
      addToCart() {
        if (!this.product) return;
        window.Cart.add(this.product, this.selectedSize, this.qty);
        this.justAdded = true;
        setTimeout(() => { this.justAdded = false; }, 1500);
      },
      async loadProduct() {
        this.loading = true;
        let list = [];
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('сервер ответил ' + res.status);
          const data = await res.json();
          list = (data.products && data.products.length) ? data.products : window.DEMO_PRODUCTS;
        } catch (err) {
          list = window.DEMO_PRODUCTS;
        }
        this.product = list.find((p) => String(p.id) === String(productId)) || null;
        this.loading = false;
      }
    },
    mounted() {
      this.loadProduct();
    }
  }).mount('#product-app');
}

mountProductApp();
