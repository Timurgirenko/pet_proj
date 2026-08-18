require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MS_LOGIN = process.env.MOYSKLAD_LOGIN;
const MS_PASSWORD = process.env.MOYSKLAD_PASSWORD;
const MS_TOKEN = process.env.MOYSKLAD_TOKEN; // альтернатива логину/паролю
const CACHE_TTL_MS = (Number(process.env.CACHE_TTL_MINUTES) || 60) * 60 * 1000;

let cache = { data: null, fetchedAt: 0 };

function getAuthHeader() {
  if (MS_TOKEN) {
    return { Authorization: `Bearer ${MS_TOKEN}` };
  }
  if (MS_LOGIN && MS_PASSWORD) {
    const basic = Buffer.from(`${MS_LOGIN}:${MS_PASSWORD}`).toString('base64');
    return { Authorization: `Basic ${basic}` };
  }
  throw new Error('Не заданы MOYSKLAD_TOKEN или MOYSKLAD_LOGIN/MOYSKLAD_PASSWORD в .env');
}

// Переводит "сырой" ответ МойСклад в простой формат для сайта
function mapProduct(row) {
  const priceObj = (row.salePrices || [])[0];
  const price = priceObj ? Math.round(priceObj.value / 100) : null;
  return {
    id: row.id,
    name: row.name,
    fabric: row.description || '',
    price,
    article: row.article || '',
    category: (row.productFolder && row.productFolder.name) || 'Без категории',
  };
}

async function fetchProductsFromMoySklad() {
  const headers = {
    ...getAuthHeader(),
    'Accept-Encoding': 'gzip',
  };

  // /entity/product — только товары (без услуг и комплектов)
  // expand=productFolder — чтобы сразу получить название категории товара
  // limit можно увеличить постранично при большом каталоге
  const url = 'https://api.moysklad.ru/api/remap/1.2/entity/product?expand=productFolder&limit=100';

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`МойСклад API ответил ${res.status}: ${text}`);
  }
  const json = await res.json();
  return (json.rows || []).map(mapProduct);
}

async function getProducts() {
  const isFresh = cache.data && (Date.now() - cache.fetchedAt) < CACHE_TTL_MS;
  if (isFresh) return cache.data;

  const products = await fetchProductsFromMoySklad();
  cache = { data: products, fetchedAt: Date.now() };
  return products;
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json({ products, cachedAt: new Date(cache.fetchedAt).toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить товары из МойСклад', details: err.message });
  }
});

// Принудительно обновить кэш (например, дёрнуть после изменений в МойСклад)
app.post('/api/products/refresh', async (req, res) => {
  try {
    cache = { data: null, fetchedAt: 0 };
    const products = await getProducts();
    res.json({ products, cachedAt: new Date(cache.fetchedAt).toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось обновить товары', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сайт запущен: http://localhost:${PORT}`);
});
