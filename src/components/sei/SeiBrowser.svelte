<script>
  import { onMount } from 'svelte';

  /**
   * The official index is a plain static tree. The catalog is derived data, so a
   * failed or stale read only affects this page, never a client resolution.
   * A detail view is the same page with `?sei=<name>`; it needs no route rebuild.
   */
  const INDEX = 'https://raw.githubusercontent.com/Hosihikari/SeiIndex/main';
  const INDEX_PAGE = 'https://github.com/Hosihikari/SeiIndex';

  const strings = {
    en: {
      search: 'Search',
      searchPlaceholder: 'Search sei…',
      searchHint: 'Press / to search',
      filters: 'Filters',
      tag: 'Tags',
      license: 'Licences',
      filterTags: 'Filter tags',
      all: 'All',
      showFilters: 'Filters',
      sort: 'Sort by:',
      sortBest: 'Best match',
      sortVersion: 'Newest',
      sortName: 'Name',
      view: 'View:',
      layout: 'Layout',
      listView: 'List',
      gridView: 'Grid',
      unlisted: 'Include unlisted',
      deprecatedOnly: 'Deprecated only',
      loading: 'Loading the index…',
      loadingDetail: 'Loading versions…',
      loadFailed: 'The catalog could not be read. Seiko can still use the index directly.',
      retry: 'Retry',
      summary: (shown, all) => `${shown} of ${all} sei`,
      empty: 'No sei match these filters.',
      clear: 'Clear filters',
      by: 'by',
      copy: 'Copy',
      copied: 'Copied',
      copyHint: (command) => `Copy ${command}`,
      versions: 'Versions',
      versionCount: (n) => (n === 1 ? '1 version' : `${n} versions`),
      noVersions: 'This sei has no versions yet.',
      yanked: 'yanked',
      deprecated: 'deprecated',
      unlisted: 'unlisted',
      advisory: { critical: 'critical', high: 'high', moderate: 'moderate', low: 'low' },
      yankedGroup: (count) => `Show ${count} yanked`,
      authors: 'Authors',
      project: 'Project page',
      source: 'Source',
      prerequisites: 'Needs',
      rids: 'Platforms',
      allPlatforms: 'Any platform',
      install: 'sk add',
      installTitle: 'Install',
      up: 'Back to list',
      notFound: 'That sei is not in the catalog.',
      latest: 'Latest',
      noJs: 'JavaScript is off; this browser page cannot load the catalog.',
      direct: 'Read the index directly',
    },
    zh: {
      search: '搜索',
      searchPlaceholder: '搜索 sei…',
      searchHint: '按 / 搜索',
      filters: '筛选',
      tag: '标签',
      license: '协议',
      filterTags: '筛选标签',
      all: '全部',
      showFilters: '筛选',
      sort: '排序：',
      sortBest: '最佳匹配',
      sortVersion: '最新',
      sortName: '名字',
      view: '每页：',
      layout: '布局',
      listView: '列表',
      gridView: '网格',
      unlisted: '包含已下架',
      deprecatedOnly: '只看已弃用',
      loading: '正在读取索引…',
      loadingDetail: '正在读取版本…',
      loadFailed: 'catalog 读取失败。Seiko 仍可直接使用该索引。',
      retry: '重试',
      summary: (shown, all) => `显示 ${shown} / ${all} 个 sei`,
      empty: '没有 sei 符合这些筛选。',
      clear: '清除筛选',
      by: '作者',
      copy: '复制',
      copied: '已复制',
      copyHint: (command) => `复制 ${command}`,
      versions: '版本',
      versionCount: (n) => `${n} 个版本`,
      noVersions: '这个 sei 还没有版本。',
      yanked: '已撤回',
      deprecated: '已弃用',
      unlisted: '已下架',
      advisory: { critical: '严重', high: '高', moderate: '中', low: '低' },
      yankedGroup: (count) => `展开 ${count} 个已撤回版本`,
      authors: '作者',
      project: '项目页',
      source: '源码',
      prerequisites: '需要',
      rids: '平台',
      allPlatforms: '任意平台',
      install: 'sk add',
      installTitle: '安装',
      up: '返回列表',
      notFound: 'catalog 里没有这个 sei。',
      latest: '最新',
      noJs: 'JavaScript 已关闭，这个页面无法读取 catalog。',
      direct: '直接读取索引',
    },
  };

  let { lang = 'en' } = $props();
  let t = $derived(strings[lang] ?? strings.en);

  let status = $state('loading');
  let entries = $state([]);
  let query = $state('');
  let tag = $state('');
  let tagFilter = $state('');
  let license = $state('');
  let sort = $state('best');
  let layout = $state('list');
  let perPage = $state('20');
  let includeUnlisted = $state(false);
  let deprecatedOnly = $state(false);
  let page = $state(1);
  let details = $state({});
  let copied = $state('');
  let route = $state('');
  let listPath = $state('./');
  let retryToken = $state(0);
  let wide = $state(true);
  let searchInput = $state();

  const countBy = (pick) => entries.filter(pick).length;
  let tags = $derived(
    [...new Set(entries.flatMap((entry) => entry.tags ?? []))]
      .sort()
      .map((name) => ({ name, count: countBy((entry) => entry.tags?.includes(name)) })),
  );
  let shownTags = $derived(
    tagFilter
      ? tags.filter((item) => item.name.toLowerCase().includes(tagFilter.trim().toLowerCase()))
      : tags,
  );
  let licenses = $derived(
    [...new Set(entries.map((entry) => entry.license).filter(Boolean))]
      .map((name) => ({ name, count: countBy((entry) => entry.license === name) }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  );

  const matches = $derived.by(() => {
    const needle = query.trim().toLowerCase();
    const rows = entries.filter((entry) => {
      if (!includeUnlisted && entry.unlisted) return false;
      if (deprecatedOnly && !entry.deprecated) return false;
      if (tag && !entry.tags?.includes(tag)) return false;
      if (license && entry.license !== license) return false;
      if (!needle) return true;
      return score(entry, needle) > 0;
    });
    return rows.sort((a, b) => {
      if (sort === 'best') {
        const delta = score(b, needle) - score(a, needle);
        if (delta) return delta;
      }
      if (sort === 'version') {
        const delta = compareVersions(b.version, a.version);
        if (delta) return delta;
      }
      return a.name.localeCompare(b.name);
    });
  });

  const pageSize = $derived(Number(perPage) || 20);
  const pageCount = $derived(Math.max(1, Math.ceil(matches.length / pageSize)));
  const current = $derived(Math.min(page, pageCount));
  const visible = $derived(matches.slice((current - 1) * pageSize, current * pageSize));
  const activeFilters = $derived(
    Boolean(query || tag || license || includeUnlisted || deprecatedOnly),
  );
  const detail = $derived(route ? entries.find((entry) => entry.name === route) : null);

  $effect(() => {
    if (retryToken > 0) void loadCatalog();
  });

  $effect(() => {
    if (!route || status !== 'ready') return;
    const cached = details[route];
    if (!cached || cached.status === 'error') void loadDetail(route);
  });

  $effect(() => {
    // Rows show authors and version counts, so the visible page is hydrated too.
    // This keeps running on the detail view: a list prefetch may be in flight
    // when a row is opened, and its caller must not be the only one waiting.
    if (status !== 'ready') return;
    for (const entry of visible) {
      if (!details[entry.name]) void loadDetail(entry.name);
    }
  });

  $effect(() => {
    query, tag, license, includeUnlisted, deprecatedOnly, perPage;
    page = 1;
  });

  onMount(() => {
    void loadCatalog();
    listPath = location.pathname;
    const mq = matchMedia('(min-width: 60rem)');
    wide = mq.matches;
    const onWide = () => {
      wide = mq.matches;
    };
    mq.addEventListener('change', onWide);
    route = new URLSearchParams(location.search).get('sei') ?? '';
    const onPop = () => {
      route = new URLSearchParams(location.search).get('sei') ?? '';
    };
    const onKey = (event) => {
      if (event.key === '/' && event.target !== searchInput && !isFormField(event.target)) {
        event.preventDefault();
        searchInput?.focus();
      }
    };
    addEventListener('popstate', onPop);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('popstate', onPop);
      removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  });

  function isFormField(node) {
    return node instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName);
  }

  async function loadCatalog() {
    status = 'loading';
    try {
      const response = await fetch(`${INDEX}/catalog.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      const catalog = await response.json();
      if (catalog?.schemaVersion !== 1 || !Array.isArray(catalog.sei)) throw new Error('schema');
      entries = catalog.sei.filter((entry) => typeof entry?.name === 'string');
      status = 'ready';
    } catch {
      entries = [];
      status = 'error';
    }
  }

  async function loadDetail(name) {
    details[name] = { status: 'loading' };
    try {
      const response = await fetch(`${INDEX}/sei/${encodeURIComponent(name)}.json`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(String(response.status));
      details[name] = { status: 'ready', data: await response.json() };
    } catch {
      details[name] = { status: 'error' };
    }
  }

  function openDetail(name) {
    route = name;
    history.pushState(null, '', `?sei=${encodeURIComponent(name)}`);
  }

  function closeDetail() {
    route = '';
    history.pushState(null, '', listPath);
  }

  function openTag(name) {
    closeDetail();
    tag = name;
  }

  function score(entry, needle) {
    if (!needle) return 1;
    const name = entry.name.toLowerCase();
    if (name === needle) return 100;
    if (name.startsWith(needle)) return 60;
    if (name.includes(needle)) return 40;
    if (entry.tags?.some((item) => item.toLowerCase() === needle)) return 25;
    if (entry.tags?.some((item) => item.toLowerCase().includes(needle))) return 15;
    if ((entry.description ?? '').toLowerCase().includes(needle)) return 10;
    return 0;
  }

  function versionOrder(version) {
    const [core, pre] = String(version ?? '').split('-', 2);
    return { parts: core.split('.').map((part) => Number.parseInt(part, 10) || 0), pre: pre ?? '' };
  }

  function compareVersions(a, b) {
    const left = versionOrder(a);
    const right = versionOrder(b);
    for (let index = 0; index < 3; index += 1) {
      const delta = (left.parts[index] ?? 0) - (right.parts[index] ?? 0);
      if (delta) return delta;
    }
    if (!left.pre || !right.pre) return (left.pre ? 0 : 1) - (right.pre ? 0 : 1);
    return left.pre.localeCompare(right.pre);
  }

  function versionRows(data) {
    const rows = Array.isArray(data?.versions) ? [...data.versions] : [];
    return rows.sort((a, b) => compareVersions(b.version, a.version));
  }

  function commandFor(name, version) {
    return version ? `sk add ${name}@${version}` : `sk add ${name}`;
  }

  function copy(text, key) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => {
        copied = key;
        setTimeout(() => {
          if (copied === key) copied = '';
        }, 1600);
      },
      () => {},
    );
  }

  function prerequisites(version) {
    return [
      ...new Set(
        (version.artifacts ?? []).flatMap((artifact) =>
          (artifact.prerequisites ?? []).map((dependency) => dependency.name),
        ),
      ),
    ];
  }

  function rids(version) {
    return [...new Set((version.artifacts ?? []).map((artifact) => artifact.rid).filter(Boolean))].sort();
  }

  function rowData(name) {
    const data = details[name];
    return data?.status === 'ready' ? data.data : null;
  }

  function clearFilters() {
    query = '';
    tag = '';
    license = '';
    includeUnlisted = false;
    deprecatedOnly = false;
  }

  function setLayout(next) {
    layout = next;
  }

  function pageList() {
    const total = pageCount;
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const pages = [...new Set([1, total, current - 1, current, current + 1])]
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);
    const out = [];
    pages.forEach((n, index) => {
      if (index && n - pages[index - 1] > 1) out.push('gap');
      out.push(n);
    });
    return out;
  }
</script>

{#if route}
  {@const entry = detail}
  <div class="sei-browser not-content">
    <a
      class="back"
      href={listPath}
      onclick={(event) => {
        event.preventDefault();
        closeDetail();
      }}>{t.up}</a>

    {#if status === 'loading'}
      <p class="muted">{t.loading}</p>
    {:else if !entry}
      <p class="muted">{t.notFound} <a href={INDEX_PAGE}>{INDEX_PAGE}</a></p>
    {:else}
      <header class="detail-head">
        <span class="avatar big" aria-hidden="true">{entry.name.slice(0, 1).toUpperCase()}</span>
        <div class="detail-title">
          <h2>{entry.name}</h2>
          {#if entry.unlisted}<span class="badge gray">{t.unlisted}</span>{/if}
          {#if entry.deprecated}<span class="badge orange">{t.deprecated}</span>{/if}
          {#if entry.advisory}
            <span class={`badge ${entry.advisory.severity === 'critical' ? 'red' : 'orange'}`}>
              {t.advisory[entry.advisory.severity] ?? entry.advisory.severity}
            </span>
          {/if}
          {#if entry.description}<p class="lede">{entry.description}</p>{/if}
        </div>
      </header>

      <div class="detail-grid">
        <section class="detail-main">
          {#if entry.version}
            {@const heroCommand = commandFor(entry.name, entry.version)}
            <div class="install">
              <span class="field-label">{t.installTitle}</span>
              <code>{heroCommand}</code>
              <button
                type="button"
                class="copy"
                aria-label={t.copyHint(heroCommand)}
                onclick={() => copy(heroCommand, `${entry.name}-hero`)}
              >{copied === `${entry.name}-hero` ? t.copied : t.copy}</button>
            </div>
          {/if}

          {#if !details[entry.name] || details[entry.name].status === 'loading'}
            <p class="muted">{t.loadingDetail}</p>
          {:else if details[entry.name].status === 'error'}
            <p class="muted">
              {t.loadFailed}
              <button type="button" class="text-button" onclick={() => loadDetail(entry.name)}>
                {t.retry}
              </button>
            </p>
          {:else}
            {@const data = details[entry.name].data}
            {@const project = data.project ?? {}}
            {@const rows = versionRows(data)}
            {@const live = rows.filter((version) => !version.yanked && !version.sourceYanked)}
            {@const yanked = rows.filter((version) => version.yanked || version.sourceYanked)}

            {#if data.deprecated}<p class="notice">{data.deprecated}</p>{/if}

            <dl class="facts">
              {#if project.authors?.length}
                <div><dt>{t.authors}</dt><dd>{project.authors.join(', ')}</dd></div>
              {/if}
              {#if project.license}
                <div><dt>{t.license}</dt><dd>{project.license}</dd></div>
              {/if}
              {#if project.projectUrl}
                <div><dt>{t.project}</dt><dd><a href={project.projectUrl}>{project.projectUrl}</a></dd></div>
              {/if}
              {#if project.repositoryUrl}
                <div><dt>{t.source}</dt><dd><a href={project.repositoryUrl}>{project.repositoryUrl}</a></dd></div>
              {/if}
            </dl>

            <h3 id="versions">{t.versions} <span class="badge">{rows.length}</span></h3>
            {#if rows.length === 0}
              <p class="muted">{t.noVersions}</p>
            {:else}
              <table class="versions">
                <thead>
                  <tr>
                    <th scope="col">{t.versions}</th>
                    <th scope="col">{t.rids}</th>
                    <th scope="col">{t.prerequisites}</th>
                    <th scope="col"><span class="sr-only">{t.install}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {#each live as version (version.version)}
                    {@const command = commandFor(entry.name, version.version)}
                    <tr>
                      <td>
                        <code>{version.version}</code>
                        {#if version.advisory}
                          <span class={`badge ${version.advisory.severity === 'critical' ? 'red' : 'orange'}`}>
                            {t.advisory[version.advisory.severity] ?? version.advisory.severity}
                          </span>
                        {/if}
                        {#if version.deprecated}<span class="badge orange">{t.deprecated}</span>{/if}
                      </td>
                      <td class="dim">{rids(version).join(', ') || t.allPlatforms}</td>
                      <td class="dim">{prerequisites(version).join(', ') || '—'}</td>
                      <td class="cell-action">
                        <button
                          type="button"
                          class="copy"
                          aria-label={t.copyHint(command)}
                          onclick={() => copy(command, `${entry.name}@${version.version}`)}
                        >{copied === `${entry.name}@${version.version}` ? t.copied : t.copy}</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
              {#if yanked.length}
                <details class="yanked">
                  <summary>{t.yankedGroup(yanked.length)}</summary>
                  <ul class="versions-plain">
                    {#each yanked as version (version.version)}
                      <li><code>{version.version}</code><span class="badge gray">{t.yanked}</span></li>
                    {/each}
                  </ul>
                </details>
              {/if}
            {/if}
          {/if}
        </section>

        <aside class="detail-side">
          {#if entry.tags?.length}
            <h3>{t.tag}</h3>
            <div class="chips">
              {#each entry.tags as item (item)}
                <button type="button" class="chip" onclick={() => openTag(item)}>#{item}</button>
              {/each}
            </div>
          {/if}
          {#if entry.version}<p class="dim small">{t.latest}: <code>{entry.version}</code></p>{/if}
        </aside>
      </div>
    {/if}
  </div>
{:else}
  <div class="sei-browser not-content">
    <label class="search-field">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
      </svg>
      <span class="sr-only">{t.search}</span>
      <input
        bind:this={searchInput}
        type="search"
        bind:value={query}
        placeholder={t.searchPlaceholder}
        spellcheck="false"
        autocomplete="off"
      />
      <kbd aria-hidden="true">/</kbd>
    </label>

    <div class="layout">
      <aside class="facets" aria-label={t.filters}>
        <details class="facet-panel" open={wide}>
        <summary>{t.showFilters}</summary>
        {#if tags.length}
          <details open>
            <summary>{t.tag}</summary>
            {#if tags.length > 8}
              <input
                class="facet-filter"
                type="search"
                bind:value={tagFilter}
                placeholder={t.filterTags}
                aria-label={t.filterTags}
              />
            {/if}
            <ul>
              <li>
                <button type="button" class:on={!tag} onclick={() => (tag = '')}>
                  <span>{t.all}</span><span class="dim">{entries.length}</span>
                </button>
              </li>
              {#each shownTags as item (item.name)}
                <li>
                  <button type="button" class:on={tag === item.name} onclick={() => (tag = item.name)}>
                    <span>#{item.name}</span><span class="dim">{item.count}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </details>
        {/if}

        {#if licenses.length}
          <details open>
            <summary>{t.license}</summary>
            <ul>
              <li>
                <button type="button" class:on={!license} onclick={() => (license = '')}>
                  <span>{t.all}</span><span class="dim">{entries.length}</span>
                </button>
              </li>
              {#each licenses as item (item.name)}
                <li>
                  <button type="button" class:on={license === item.name} onclick={() => (license = item.name)}>
                    <span>{item.name}</span><span class="dim">{item.count}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </details>
        {/if}

        <div class="toggles">
          <label><input type="checkbox" bind:checked={includeUnlisted} />{t.unlisted}</label>
          <label><input type="checkbox" bind:checked={deprecatedOnly} />{t.deprecatedOnly}</label>
        </div>
        </details>
      </aside>

      <div class="main">
        <div class="controls">
          <label class="control">
            <span>{t.sort}</span>
            <select bind:value={sort}>
              <option value="best">{t.sortBest}</option>
              <option value="version">{t.sortVersion}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </label>
          <label class="control">
            <span>{t.view}</span>
            <select bind:value={perPage}>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <div class="view-toggle" role="group" aria-label={t.layout}>
            <button
              type="button"
              class:on={layout === 'list'}
              aria-pressed={layout === 'list'}
              aria-label={t.listView}
              onclick={() => setLayout('list')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
              </svg>
            </button>
            <button
              type="button"
              class:on={layout === 'grid'}
              aria-pressed={layout === 'grid'}
              aria-label={t.gridView}
              onclick={() => setLayout('grid')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" />
                <rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" />
              </svg>
            </button>
          </div>

          <nav class="pager" aria-label={t.summary(matches.length, entries.length)}>
            <button type="button" disabled={current <= 1} onclick={() => (page = current - 1)}>←</button>
            {#each pageList() as item, index (index)}
              {#if item === 'gap'}
                <span class="dim">…</span>
              {:else}
                <button
                  type="button"
                  class:on={item === current}
                  aria-current={item === current ? 'page' : undefined}
                  onclick={() => (page = item)}>{item}</button>
              {/if}
            {/each}
            <button type="button" disabled={current >= pageCount} onclick={() => (page = current + 1)}>→</button>
          </nav>
        </div>

        <p class="status" aria-live="polite">
          {#if status === 'loading'}
            {t.loading}
          {:else if status === 'error'}
            {t.loadFailed}
            <button type="button" class="text-button" onclick={() => (retryToken += 1)}>{t.retry}</button>
          {:else}
            {t.summary(matches.length, entries.length)}
            {#if activeFilters}
              <button type="button" class="text-button" onclick={clearFilters}>{t.clear}</button>
            {/if}
          {/if}
        </p>

        <noscript>
          <p class="empty">{t.noJs} <a href={`${INDEX}/index.json`}>{t.direct}</a></p>
        </noscript>

        {#if status === 'ready' && visible.length === 0}
          <p class="empty">
            {t.empty}
            {#if activeFilters}
              <button type="button" class="text-button" onclick={clearFilters}>{t.clear}</button>
            {/if}
          </p>
        {/if}

        <ul class="results" class:grid={layout === 'grid'}>
          {#each visible as entry (entry.name)}
            {@const href = `?sei=${encodeURIComponent(entry.name)}`}
            {@const data = rowData(entry.name)}
            <li class="row">
              <a
                class="avatar"
                href={href}
                aria-hidden="true"
                tabindex="-1"
                onclick={(event) => {
                  event.preventDefault();
                  openDetail(entry.name);
                }}>{entry.name.slice(0, 1).toUpperCase()}</a>
              <div class="row-body">
                <div class="row-head">
                  <a
                    class="name"
                    href={href}
                    onclick={(event) => {
                      event.preventDefault();
                      openDetail(entry.name);
                    }}>{entry.name}</a>
                  {#if data?.project?.authors?.length}
                    <span class="by">{t.by} {data.project.authors.join(', ')}</span>
                  {/if}
                  {#if entry.unlisted}<span class="badge gray">{t.unlisted}</span>{/if}
                  {#if entry.deprecated}<span class="badge orange">{t.deprecated}</span>{/if}
                  {#if entry.advisory}
                    <span class={`badge ${entry.advisory.severity === 'critical' ? 'red' : 'orange'}`}>
                      {t.advisory[entry.advisory.severity] ?? entry.advisory.severity}
                    </span>
                  {/if}
                </div>
                {#if entry.description}<p class="sei-description">{entry.description}</p>{/if}
                <div class="row-meta">
                  {#if entry.license}<span class="badge">{entry.license}</span>{/if}
                  {#each entry.tags ?? [] as item (item)}
                    <button type="button" class="tag" onclick={() => (tag = item)}>#{item}</button>
                  {/each}
                </div>
                {#if layout === 'grid' && entry.version}
                  {@const command = commandFor(entry.name)}
                  <div class="row-foot">
                    <code class="command">{command}</code>
                    <button
                      type="button"
                      class="copy"
                      aria-label={t.copyHint(command)}
                      onclick={() => copy(command, entry.name)}
                    >{copied === entry.name ? t.copied : t.copy}</button>
                  </div>
                {/if}
              </div>
              {#if layout !== 'grid'}
                {@const command = commandFor(entry.name, entry.version)}
                <div class="row-side">
                  {#if entry.version}
                    <code class="dim">{entry.version}</code>
                    <span class="dim small">{data?.versions?.length ? t.versionCount(data.versions.length) : ''}</span>
                    <button
                      type="button"
                      class="copy"
                      aria-label={t.copyHint(command)}
                      onclick={() => copy(command, entry.name)}
                    >{copied === entry.name ? t.copied : t.copy}</button>
                  {/if}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}

<style>
  .sei-browser {
    margin-block: 1rem 2.5rem;
  }

  .search-field {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .search-icon {
    position: absolute;
    inset-inline-start: 0.75rem;
    color: var(--sl-color-gray-3);
    pointer-events: none;
  }

  input[type='search'] {
    width: 100%;
    padding: 0.7rem 2.2rem 0.7rem 2.3rem;
    border: 1px solid var(--sl-color-hairline);
    border-radius: 0;
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
    font: inherit;
  }

  .search-field kbd {
    position: absolute;
    inset-inline-end: 0.6rem;
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--sl-color-hairline);
    color: var(--sl-color-gray-3);
    font-family: var(--sl-font-mono);
    font-size: var(--sl-text-xs);
    pointer-events: none;
  }

  input[type='search']:focus-visible,
  button:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 1px;
  }

  .layout {
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 60rem) {
    .layout {
      grid-template-columns: 15rem minmax(0, 1fr);
      align-items: start;
    }

    .facets {
      position: sticky;
      top: calc(var(--sl-nav-height) + 1rem);
      max-height: calc(100vh - var(--sl-nav-height) - 2rem);
      overflow: auto;
    }
  }

  .facets {
    display: grid;
    gap: 0.75rem;
    align-content: start;
    font-size: var(--sl-text-sm);
  }

  .facet-panel {
    display: block;
  }

  .facet-panel[open] {
    display: grid;
    gap: 0.75rem;
  }

  /* Author `display` on the children beats the UA collapse rule. */
  .facet-panel:not([open]) > :not(summary) {
    display: none;
  }

  .facet-panel > summary {
    display: none;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--sl-color-hairline);
    background: color-mix(in oklab, var(--sl-color-bg) 94%, var(--sl-color-accent-low));
    font-weight: 700;
    cursor: pointer;
  }

  .facet-panel > summary::after {
    content: '⌄';
    float: inline-end;
    color: var(--sl-color-gray-3);
  }

  .facet-panel:not([open]) > summary::after {
    content: '›';
  }

  @media (max-width: 59.99rem) {
    .facet-panel > summary {
      display: block;
    }

    .facet-panel[open] > summary {
      margin-bottom: 0.75rem;
    }
  }

  .facets details {
    padding: 0.55rem 0.7rem 0.6rem;
    border: 1px solid var(--sl-color-hairline);
    background: color-mix(in oklab, var(--sl-color-bg) 94%, var(--sl-color-accent-low));
  }

  .facets summary {
    font-weight: 700;
    cursor: pointer;
    list-style: none;
  }

  .facets summary::after {
    content: '⌄';
    float: inline-end;
    color: var(--sl-color-gray-3);
  }

  .facets details:not([open]) summary::after {
    content: '›';
  }

  .facet-filter {
    margin-top: 0.4rem;
    padding: 0.25rem 0.4rem !important;
    font-size: var(--sl-text-xs) !important;
  }

  .facets ul {
    display: grid;
    gap: 0.1rem;
    margin: 0.4rem 0 0;
    padding: 0;
    list-style: none;
  }

  .facets li button {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.22rem 0.3rem;
    border: 0;
    background: none;
    color: var(--sl-color-gray-2);
    font: inherit;
    font-size: var(--sl-text-xs);
    text-align: start;
    cursor: pointer;
  }

  .facets li button:hover {
    background: var(--sl-color-accent-low);
    color: var(--sl-color-text-accent);
  }

  button.on,
  .facets li button.on {
    background: var(--sl-color-accent-low);
    color: var(--sl-color-text-accent);
    font-weight: 650;
  }

  .toggles {
    display: grid;
    gap: 0.35rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--sl-color-hairline);
    background: color-mix(in oklab, var(--sl-color-bg) 94%, var(--sl-color-accent-low));
    font-size: var(--sl-text-xs);
  }

  .toggles label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }

  .main {
    display: grid;
    gap: 0.7rem;
    min-width: 0;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.9rem;
  }

  .control {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--sl-color-gray-2);
    font-size: var(--sl-text-sm);
    font-weight: 600;
  }

  .control select {
    padding: 0.3rem 0.4rem;
    border: 1px solid var(--sl-color-hairline);
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
    font: inherit;
    font-size: var(--sl-text-sm);
  }

  .view-toggle {
    display: flex;
    margin-inline-start: auto;
  }

  .view-toggle button,
  .pager button {
    display: grid;
    place-items: center;
    min-width: 1.9rem;
    padding: 0.35rem 0.4rem;
    border: 1px solid var(--sl-color-hairline);
    background: none;
    color: var(--sl-color-gray-2);
    font: inherit;
    font-size: var(--sl-text-xs);
    cursor: pointer;
  }

  .view-toggle button + button,
  .pager button + button {
    border-inline-start: 0;
  }

  .pager button:disabled {
    color: var(--sl-color-gray-5);
    cursor: default;
  }

  .pager {
    display: flex;
    align-items: center;
    margin-inline-start: auto;
  }

  .status,
  .empty,
  .dim,
  .muted {
    color: var(--sl-color-gray-3);
  }

  .status,
  .empty,
  .muted {
    margin: 0;
    font-size: var(--sl-text-xs);
  }

  .results {
    display: grid;
    gap: 0.7rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .results.grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 48rem) {
    .results.grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .row {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    min-height: 8.8rem;
    overflow: hidden;
    padding: 0.85rem;
    border: 1px solid var(--sl-color-hairline);
    background: color-mix(in oklab, var(--sl-color-bg) 94%, var(--sl-color-accent-low));
    transition: border-color 150ms ease;
  }

  .grid .row {
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
  }

  .grid .row-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.3rem;
  }

  .grid .row-meta {
    margin-top: auto;
    mask-image: none;
  }

  .row:hover {
    border-color: var(--sl-color-accent-high);
  }

  .avatar {
    display: grid;
    flex: none;
    align-self: flex-start;
    place-items: center;
    width: 3.8rem;
    height: 3.8rem;
    border: 1px solid var(--sl-color-hairline);
    background: var(--sl-color-accent-low);
    color: var(--sl-color-text-accent);
    font-size: var(--sl-text-lg);
    font-weight: 700;
    text-decoration: none;
  }

  .row-body {
    display: grid;
    flex: 1;
    gap: 0.3rem;
    min-width: 0;
    align-content: start;
  }

  .grid .row-body {
    width: 100%;
  }

  /* The grid card has room for the whole description. */
  .grid .sei-description {
    display: block;
    min-height: 3em;
    overflow: visible;
    -webkit-line-clamp: none;
  }

  .row-head {
    display: flex;
    flex-wrap: nowrap;
    align-items: baseline;
    gap: 0.4rem;
    min-width: 0;
    overflow: hidden;
  }

  /* Long names truncate instead of wrapping, so list rows keep one height. */
  .name {
    min-width: 0;
    overflow: hidden;
    color: var(--sl-color-text-accent);
    font-size: var(--sl-text-lg);
    font-weight: 700;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name:hover {
    text-decoration: underline;
  }

  .by {
    flex: none;
    color: var(--sl-color-gray-3);
    font-size: var(--sl-text-xs);
    white-space: nowrap;
  }

  .grid .row-head {
    flex-wrap: wrap;
  }

  .grid .name {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .sei-description {
    display: -webkit-box;
    min-height: 3em;
    margin: 0;
    overflow: hidden;
    color: var(--sl-color-text);
    font-size: var(--sl-text-sm);
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .row-meta,
  .row-foot,
  .row-side {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
    font-size: var(--sl-text-xs);
  }

  /* One line only: a wrapped tag row would make every card a different height. */
  .row-meta {
    flex-wrap: nowrap;
    overflow: hidden;
    mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent);
  }

  .row-meta > * {
    flex: none;
  }

  .row-foot {
    flex-wrap: wrap;
  }

  .row-side {
    flex: none;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 0.15rem;
  }

  .row-foot {
    justify-content: space-between;
    margin-top: 0.2rem;
    padding-top: 0.4rem;
    border-top: 1px solid var(--sl-color-hairline);
  }

  .command {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--sl-color-gray-3);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--sl-color-hairline);
    color: var(--sl-color-gray-2);
    font-size: var(--sl-text-xs);
    white-space: nowrap;
  }

  .badge.red {
    border-color: var(--sl-color-red);
    color: var(--sl-color-red-high);
  }

  .badge.orange {
    border-color: var(--sl-color-orange);
    color: var(--sl-color-orange-high);
  }

  .badge.gray {
    color: var(--sl-color-gray-3);
  }

  .tag {
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--sl-color-hairline);
    background: none;
    color: var(--sl-color-gray-2);
    font: inherit;
    font-size: var(--sl-text-xs);
    cursor: pointer;
  }

  .tag:hover {
    border-color: var(--sl-color-accent-high);
    color: var(--sl-color-text-accent);
  }

  .copy,
  .text-button {
    padding: 0.05rem 0.45rem;
    border: 1px solid var(--sl-color-hairline);
    background: none;
    color: var(--sl-color-gray-2);
    font: inherit;
    font-size: var(--sl-text-xs);
    white-space: nowrap;
    cursor: pointer;
  }

  .copy:hover,
  .text-button:hover {
    border-color: var(--sl-color-accent-high);
    color: var(--sl-color-text-accent);
  }

  .text-button {
    border: 0;
    text-decoration: underline;
  }

  .small {
    font-size: var(--sl-text-xs);
  }

  /* detail */

  .back {
    display: inline-block;
    margin-bottom: 0.75rem;
    color: var(--sl-color-gray-3);
    font-size: var(--sl-text-xs);
    text-decoration: none;
  }

  .back:hover {
    color: var(--sl-color-text-accent);
  }

  .back::before {
    content: '← ';
  }

  .detail-head {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--sl-color-hairline);
  }

  .detail-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
  }

  .detail-title h2 {
    width: 100%;
    margin: 0;
    font-size: var(--sl-text-3xl);
    overflow-wrap: anywhere;
  }

  .lede {
    width: 100%;
    margin: 0.2rem 0 0;
    color: var(--sl-color-text);
  }

  .detail-grid {
    display: grid;
    gap: 1.5rem;
    padding-top: 1rem;
  }

  @media (min-width: 50rem) {
    .detail-grid {
      grid-template-columns: minmax(0, 1fr) 15rem;
      align-items: start;
    }
  }

  .detail-main {
    display: grid;
    gap: 0.8rem;
    min-width: 0;
  }

  .install {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--sl-color-hairline);
    background: var(--sl-color-bg-inline-code);
    font-size: var(--sl-text-sm);
  }

  .install code {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field-label {
    color: var(--sl-color-text-accent);
    font-size: var(--sl-text-xs);
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    font-size: var(--sl-text-sm);
    font-weight: 650;
  }

  .facts {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    font-size: var(--sl-text-sm);
  }

  .facts div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .facts dt {
    min-width: 5rem;
    color: var(--sl-color-gray-3);
  }

  .facts dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .versions {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--sl-text-sm);
  }

  .versions th,
  .versions td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--sl-color-hairline);
    text-align: start;
    vertical-align: middle;
  }

  .versions th {
    color: var(--sl-color-gray-3);
    font-size: var(--sl-text-xs);
    font-weight: 600;
  }

  .versions tbody tr:hover {
    background: color-mix(in oklab, var(--sl-color-bg) 92%, var(--sl-color-accent-low));
  }

  .cell-action {
    width: 1%;
    text-align: end;
  }

  .versions-plain {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.4rem 0 0;
    padding: 0;
    list-style: none;
    font-size: var(--sl-text-xs);
  }

  .versions-plain li {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .yanked summary {
    color: var(--sl-color-gray-3);
    font-size: var(--sl-text-xs);
    cursor: pointer;
  }

  .notice {
    margin: 0;
    padding: 0.4rem 0.5rem;
    border-inline-start: 2px solid var(--sl-color-orange);
    color: var(--sl-color-orange-high);
    font-size: var(--sl-text-sm);
  }

  .detail-side {
    display: grid;
    gap: 0.5rem;
    align-content: start;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .chip {
    padding: 0.05rem 0.45rem;
    border: 1px solid var(--sl-color-hairline);
    background: none;
    color: var(--sl-color-gray-2);
    font: inherit;
    font-size: var(--sl-text-xs);
    cursor: pointer;
  }

  .chip:hover {
    border-color: var(--sl-color-accent-high);
    color: var(--sl-color-text-accent);
  }

  @media (max-width: 40rem) {
    .avatar {
      width: 2.8rem;
      height: 2.8rem;
      font-size: var(--sl-text-sm);
    }

    .name {
      font-size: var(--sl-text-base);
    }

    .row-side {
      align-items: flex-end;
    }
  }
</style>
