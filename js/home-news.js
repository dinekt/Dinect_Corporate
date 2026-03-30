// ホーム画面: articles.json から最新テックニュース3件を動的表示
(function () {
  var ARTICLES_JSON = 'tech-news/articles.json';
  var MAX_ITEMS = 3;
  var feedEl = document.getElementById('tech-news-feed');
  if (!feedEl) return;

  fetch(ARTICLES_JSON)
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then(function (data) {
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

      feedEl.innerHTML = '';
      latest.forEach(function (date) {
        var parts = date.split('-');
        var dateStr = parts[0] + '.' + parts[1] + '.' + parts[2];
        var title = 'テックニュース ' + parseInt(parts[0]) + '年' + parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';

        var a = document.createElement('a');
        a.href = 'tech-news.html#' + date;
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
})();
