function initializeBlogFilters() {
  const controls = document.querySelector<HTMLElement>('[data-blog-controls]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const categorySelect = document.querySelector<HTMLSelectElement>(
    '[data-category-filter]',
  );
  const tagSelect = document.querySelector<HTMLSelectElement>('[data-tag-filter]');
  const clearButton = document.querySelector<HTMLButtonElement>('[data-clear-filters]');
  const resultCount = document.querySelector<HTMLElement>('[data-result-count]');
  const emptyState = document.querySelector<HTMLElement>('[data-no-results]');
  const cards = [...document.querySelectorAll<HTMLElement>('[data-post-card]')];

  if (!controls || !input || !categorySelect || !tagSelect || !cards.length) return;
  const searchInput = input;
  const categoryFilter = categorySelect;
  const tagFilter = tagSelect;
  const categoryValues = new Set(
    [...categorySelect.options].map((option) => option.value),
  );
  const tagValues = new Set([...tagSelect.options].map((option) => option.value));

  function applyFilters(syncUrl = false) {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const tag = tagFilter.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const fields = [
        card.dataset.title ?? '',
        card.dataset.summary ?? '',
        card.dataset.category ?? '',
      ];
      const tags = JSON.parse(card.dataset.tags ?? '[]') as string[];
      const matchesQuery =
        !query ||
        [...fields, ...tags].some((field) => field.toLowerCase().includes(query));
      const matchesCategory = !category || card.dataset.category === category;
      const matchesTag = !tag || tags.includes(tag);
      const visible = matchesQuery && matchesCategory && matchesTag;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (resultCount) resultCount.textContent = `共 ${visibleCount} 篇文章`;
    if (emptyState) emptyState.hidden = visibleCount > 0;

    if (syncUrl) {
      const params = new URLSearchParams(window.location.search);
      query ? params.set('q', searchInput.value.trim()) : params.delete('q');
      category ? params.set('category', category) : params.delete('category');
      tag ? params.set('tag', tag) : params.delete('tag');
      const search = params.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${search ? `?${search}` : ''}`,
      );
    }
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') ?? '').trim();
    const category = params.get('category') ?? '';
    const tag = params.get('tag') ?? '';
    const normalizedCategory = categoryValues.has(category) ? category : '';
    const normalizedTag = tagValues.has(tag) ? tag : '';
    searchInput.value = query;
    categoryFilter.value = normalizedCategory;
    tagFilter.value = normalizedTag;
    if (query) params.set('q', query);
    else params.delete('q');
    if (normalizedCategory) params.set('category', normalizedCategory);
    else params.delete('category');
    if (normalizedTag) params.set('tag', normalizedTag);
    else params.delete('tag');
    const normalizedSearch = params.toString();
    const normalizedUrl = `${window.location.pathname}${normalizedSearch ? `?${normalizedSearch}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== normalizedUrl) {
      window.history.replaceState(null, '', normalizedUrl);
    }
    applyFilters();
  }

  searchInput.addEventListener('input', () => applyFilters(true));
  categoryFilter.addEventListener('change', () => applyFilters(true));
  tagFilter.addEventListener('change', () => applyFilters(true));
  clearButton?.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    tagFilter.value = '';
    applyFilters(true);
    searchInput.focus();
  });
  window.addEventListener('popstate', restoreFromUrl);

  restoreFromUrl();
  controls.hidden = false;
}

initializeBlogFilters();
