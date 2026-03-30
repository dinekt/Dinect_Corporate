// ホーム画面: articles.json から最新テックニュース3件を動的表示
(function () {
  var ARTICLES_JSON = 'tech-news/articles.json';
  var ARTICLES_BASE = 'tech-news';
  var MAX_ITEMS = 3;
  var feedEl = document.getElementById('tech-news-feed');
  if (!feedEl) return;

  fetch(ARTICLES_JSON)
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then(function (data) {
      // 全日付を集めて降順ソート
      var allDates = [];
      data.months.forEach(function (m) {
        allDates = allDates.concat(m.articles);
      });
      allDates.sort().reverse();

      var latest = allDates.slice(0, MAX_ITEMS);
      if (latest.length === 0) {
        feedEl.innerHTML = '<p class="feed-muted" style="padding:12px;">記事がありません。</p>';
        return;
      }

      // 各記事のMarkdownから1行目のタイトルを取得
      var promises = latest.map(function (date) {
        var month = date.substring(0, 7);
        return fetch(ARTICLES_BASE + '/' + month + '/' + date + '.md')
          .then(function (res) {
            if (!res.ok) return { date: date, title: '' };
            return res.text().then(function (md) {
              return { date: date, title: extractTitle(md) };
            });
          })
          .catch(function () {
            return { date: date, title: '' };
          });
      });

      return Promise.all(promises);
    })
    .then(function (items) {
      if (!items) return;
      feedEl.innerHTML = '';
      items.forEach(function (item) {
        var parts = item.date.split('-');
        var dateStr = parts[0] + '.' + parts[1] + '.' + parts[2];
        var title = item.title || 'Tech News ' + item.date;

        var a = document.createElement('a');
        a.href = 'tech-news.html#' + item.date;
        a.className = 'feed-item';

        var time = document.createElement('time');
        time.textContent = dateStr;

        var body = document.createElement('div');
        body.className = 'feed-item-body';

        var p = document.createElement('p');
        p.className = 'feed-item-title';
        p.textContent = title;

        var tag = document.createElement('span');
        tag.className = 'feed-item-tag';
        tag.textContent = 'daily';

        body.appendChild(p);
        body.appendChild(tag);
        a.appendChild(time);
        a.appendChild(body);
        feedEl.appendChild(a);
      });
    })
    .catch(function () {
      feedEl.innerHTML = '<p class="feed-muted" style="padding:12px;">テックニュースの読み込みに失敗しました。</p>';
    });

  function extractTitle(markdown) {
    // h2以下の見出しからTOP3のタイトルを抽出してサマリーにする
    var lines = markdown.split('\n');
    var h3Titles = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      // "### 1. タイトル" パターンからタイトルを抽出
      var match = line.match(/^###\s+\d+\.\s+(.+)/);
      if (match) {
        h3Titles.push(match[1]);
        if (h3Titles.length >= 3) break;
      }
    }
    if (h3Titles.length > 0) {
      return h3Titles.join(' / ') + ' ほか';
    }
    // フォールバック: 最初のh1タイトルを使う
    for (var j = 0; j < lines.length; j++) {
      if (lines[j].trim().startsWith('# ')) {
        return lines[j].trim().replace(/^#\s+/, '');
      }
    }
    return '';
  }
})();
