// Простая корзина на localStorage — без бэкенда, доступна на всех страницах.
// Позиция определяется парой id товара + размер (один товар в двух размерах —
// это две строки в корзине).
window.Cart = (function () {
  const STORAGE_KEY = 'kralya_cart';

  function getItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  }

  function add(product, size, qty) {
    qty = qty || 1;
    const items = getItems();
    const existing = items.find((it) => it.id === product.id && it.size === size);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category || '',
        size: size,
        qty: qty
      });
    }
    saveItems(items);
  }

  function updateQty(id, size, qty) {
    let items = getItems();
    if (qty < 1) {
      items = items.filter((it) => !(it.id === id && it.size === size));
    } else {
      const item = items.find((it) => it.id === id && it.size === size);
      if (item) item.qty = qty;
    }
    saveItems(items);
  }

  function remove(id, size) {
    const items = getItems().filter((it) => !(it.id === id && it.size === size));
    saveItems(items);
  }

  function clear() {
    saveItems([]);
  }

  function count(items) {
    return (items || getItems()).reduce((sum, it) => sum + it.qty, 0);
  }

  function total(items) {
    return (items || getItems()).reduce((sum, it) => sum + (it.price || 0) * it.qty, 0);
  }

  return { getItems, saveItems, add, updateQty, remove, clear, count, total };
})();

// Значки с количеством товаров (могут быть сразу в нескольких местах —
// в шапке, в мобильном меню и т.д.) — обновляем все разом.
function refreshCartBadges() {
  const n = window.Cart.count();
  document.querySelectorAll('.cart-count').forEach(function (el) {
    el.textContent = n;
    el.classList.toggle('is-empty', n === 0);
  });
}

window.addEventListener('cart:updated', refreshCartBadges);
document.addEventListener('sections:loaded', refreshCartBadges);
document.addEventListener('DOMContentLoaded', refreshCartBadges);
