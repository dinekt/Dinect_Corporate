// Tech News - ローカルのarticles.jsonから記事一覧を取得・表示
(function () {
  const ARTICLES_JSON = 'tech-news/articles.json';
  const ARTICLES_BASE = 'tech-news';

  const archiveEl = document.getElementById('news-archive');
  const contentEl = document.getElementById('news-content');

  // 全記事データ: { '2026-03': ['2026-03-05', '2026-03-04', ...] }
  let articlesByMonth = {};
  let allDates = [];

  init();

  async function init() {
    try {
      await loadArchive();
      // URLハッシュで日付指定があればその記事を表示、なければ最新
      const hash = window.location.hash.replace('#', '');
      const targetDate = allDates.includes(hash) ? hash : allDates[0];
      if (targetDate) {
        loadArticle(targetDate);
      } else {
        contentEl.innerHTML = '<p class="news-error">記事が見つかりませんでした。</p>';
      }
    } catch (err) {
      archiveEl.innerHTML = '<p class="news-error">記事一覧の取得に失敗しました。</p>';
      contentEl.innerHTML = '<p class="news-error">記事の読み込みに失敗しました。</p>';
    }
  }

  async function loadArchive() {
    // articles.jsonから記事一覧を取得
    const res = await fetch(ARTICLES_JSON);
    if (!res.ok) throw new Error('Failed to fetch articles.json');
    const data = await res.json();

    articlesByMonth = {};
    allDates = [];
    for (const { month, articles } of data.months) {
      if (articles.length > 0) {
        articlesByMonth[month] = articles;
        allDates.push(...articles);
      }
    }
    allDates.sort().reverse();

    renderArchive();
  }

  function renderArchive() {
    archiveEl.innerHTML = '';

    for (const month of Object.keys(articlesByMonth).sort().reverse()) {
      const monthLabel = document.createElement('div');
      monthLabel.className = 'news-archive-month';
      monthLabel.textContent = formatMonth(month);
      archiveEl.appendChild(monthLabel);

      for (const date of articlesByMonth[month]) {
        const link = document.createElement('a');
        link.className = 'news-date-link';
        link.textContent = formatDate(date);
        link.href = `#${date}`;
        link.dataset.date = date;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = date;
          loadArticle(date);
        });
        archiveEl.appendChild(link);
      }
    }
  }

  async function loadArticle(date) {
    // サイドバーのアクティブ状態を更新
    document.querySelectorAll('.news-date-link').forEach(el => {
      el.classList.toggle('active', el.dataset.date === date);
    });

    contentEl.innerHTML = '<p class="news-loading">記事を読み込み中...</p>';

    try {
      const month = date.substring(0, 7);
      const res = await fetch(`${ARTICLES_BASE}/${month}/${date}.md`);
      if (!res.ok) throw new Error('Failed to fetch article');
      const markdown = await res.text();

      const dateHeader = document.createElement('div');
      dateHeader.className = 'news-date-header';
      dateHeader.textContent = formatDateFull(date);

      contentEl.innerHTML = '';
      contentEl.appendChild(dateHeader);

      const articleBody = document.createElement('div');
      articleBody.innerHTML = marked.parse(markdown);
      contentEl.appendChild(articleBody);

      // スムーズにトップへスクロール（モバイル時）
      if (window.innerWidth <= 768) {
        contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      contentEl.innerHTML = '<p class="news-error">記事の読み込みに失敗しました。</p>';
    }
  }

  function formatMonth(month) {
    const [y, m] = month.split('-');
    return `${y}年${parseInt(m)}月`;
  }

  function formatDate(date) {
    const [y, m, d] = date.split('-');
    return `${parseInt(m)}月${parseInt(d)}日`;
  }

  function formatDateFull(date) {
    const [y, m, d] = date.split('-');
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return `${y}年${parseInt(m)}月${parseInt(d)}日（${days[dt.getDay()]}）`;
  }

  // ハッシュ変更時に記事を切り替え
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (allDates.includes(hash)) {
      loadArticle(hash);
    }
  });

  // ネットワークアニメーション初期化
  if (typeof initSynapseNetwork === 'function') {
    initSynapseNetwork('news-network', { count: 40, connectDist: 120 });
  }
})();
