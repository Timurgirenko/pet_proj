function mountCartApp() {
  const { createApp } = Vue;

  const app = createApp({
    data() {
      return { items: window.Cart.getItems() };
    },
    computed: {
      total() {
        return window.Cart.total(this.items);
      },
      checkoutLink() {
        if (!this.items.length) return '#';
        const lines = this.items.map(
          (it) => '• ' + it.name + ', размер ' + it.size + ', ' + it.qty + ' шт.'
        );
        const text = encodeURIComponent(
          'Здравствуйте! Хочу оформить заказ:\n' + lines.join('\n') + '\n\nИтого: ' + this.total.toLocaleString('ru-RU') + ' ₽'
        );
        return 'https://t.me/' + window.TELEGRAM_USERNAME + '?text=' + text;
      }
    },
    methods: {
      formatPrice(p) {
        return window.formatPrice(p);
      },
      setQty(item, qty) {
        window.Cart.updateQty(item.id, item.size, qty);
      },
      removeItem(item) {
        window.Cart.remove(item.id, item.size);
      }
    },
    mounted() {
      window.addEventListener('cart:updated', () => {
        this.items = window.Cart.getItems();
      });
    }
  });

  window.__cartApp = app.mount('#cart-app');
}

function initCartPanel() {
  const overlay = document.getElementById('cartOverlay');
  const panel = document.getElementById('cartPanel');
  const closeBtn = document.getElementById('cartPanelClose');
  if (!overlay || !panel) return;

  mountCartApp();

  function openCart() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    overlay.classList.add('open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.cart-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openCart();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });
}

document.addEventListener('sections:loaded', initCartPanel);
