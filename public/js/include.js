// Загружает все секции, перечисленные через data-include, в том порядке,
// в котором они идут в index.html, и вставляет их вместо placeholder-элемента.
async function loadIncludes() {
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(placeholders.map(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('не удалось загрузить ' + url + ' (' + res.status + ')');
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      console.error(err);
      el.outerHTML = '<p style="padding:16px; color:#A5302E;">Не удалось загрузить раздел: ' + url + '</p>';
    }
  }));

  document.dispatchEvent(new Event('sections:loaded'));
}

loadIncludes();
