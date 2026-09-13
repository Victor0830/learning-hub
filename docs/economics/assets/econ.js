/* 經濟與金錢：互動工具
 * 每個工具是一個 [data-tool] 區塊，數字都是「假設」的教學用數字。
 * 零用錢預算和模擬投資紀錄存在 localStorage（econ-money:v1），不會上傳。
 */
(function () {
  var KEY = 'econ-money:v1';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  var store = load();

  function fmt(n) { return Math.round(n).toLocaleString('zh-TW'); }
  function money(n) { return (n < 0 ? '−' : '') + fmt(Math.abs(n)) + ' 元'; }
  function num(el, fallback) {
    var v = parseFloat(el.value);
    return isFinite(v) ? v : fallback;
  }
  function $(root, sel) { return root.querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function bind(root, fn) {
    root.querySelectorAll('input, select').forEach(function (i) { i.addEventListener('input', fn); });
    fn();
  }

  var tools = {};

  /* ---------- 一杯飲料的成本 ---------- */
  tools['drink-cost'] = function (root) {
    var MAT = 20, DAYS = 30;
    function run() {
      var price = num($(root, '[name=price]'), 60);
      var cups = num($(root, '[name=cups]'), 200);
      var rent = num($(root, '[name=rent]'), 50000);
      var wage = num($(root, '[name=wage]'), 110000);
      var other = 20000;
      $(root, '[data-out=price]').textContent = price;
      $(root, '[data-out=cups]').textContent = cups;

      var fixed = rent + wage + other;
      var sold = cups * DAYS;
      var revenue = price * sold;
      var profit = revenue - MAT * sold - fixed;
      var fixedPerCup = fixed / sold;
      var perCup = price - MAT - fixedPerCup;
      var breakeven = price > MAT ? Math.ceil(fixed / ((price - MAT) * DAYS)) : Infinity;

      $(root, '[data-out=revenue]').textContent = money(revenue);
      $(root, '[data-out=profit]').textContent = money(profit);
      $(root, '[data-out=profit]').parentNode.className = 'stat ' + (profit >= 0 ? 'good' : 'bad');
      $(root, '[data-out=percup]').textContent = (perCup < 0 ? '−' : '') + Math.abs(perCup).toFixed(1) + ' 元';
      $(root, '[data-out=breakeven]').textContent = isFinite(breakeven) ? fmt(breakeven) + ' 杯' : '永遠不會';

      var total = Math.max(price, MAT + fixedPerCup);
      function w(v) { return Math.max(0, v / total * 100) + '%'; }
      $(root, '[data-bar=cup]').innerHTML =
        '<i style="width:' + w(MAT) + ';background:var(--u4)"></i>' +
        '<i class="b" style="width:' + w(Math.min(fixedPerCup, price - MAT)) + '"></i>' +
        (perCup >= 0 ? '<i class="c" style="width:' + w(perCup) + ';background:var(--good)"></i>'
                     : '<i class="c" style="width:' + w(-perCup) + '"></i>');

      var say;
      if (profit < 0) {
        say = '😰 每個月<b>虧 ' + fmt(-profit) + ' 元</b>。每天至少要賣 <b>' + (isFinite(breakeven) ? fmt(breakeven) : '∞') + ' 杯</b>才不會賠錢。可以試試：漲價？多賣幾杯？找便宜一點的店面？';
      } else if (perCup < price * 0.1) {
        say = '🙂 有賺錢，但一杯只賺 <b>' + perCup.toFixed(1) + ' 元</b>。一杯賣 ' + price + ' 元，老闆真正放進口袋的很少。';
      } else {
        say = '😄 一個月賺 <b>' + fmt(profit) + ' 元</b>。不過別忘了：生意這麼好，很快就會有人在旁邊開一家新的飲料店（去看「價格與市場」的「競爭」）。';
      }
      $(root, '[data-out=say]').innerHTML = say;
    }
    bind(root, run);
  };

  /* ---------- 複利 ---------- */
  tools['compound'] = function (root) {
    function grow(monthly, rate, years) {
      var r = rate / 100 / 12, bal = 0, rows = [];
      for (var y = 1; y <= years; y++) {
        for (var m = 0; m < 12; m++) bal = bal * (1 + r) + monthly;
        rows.push({ year: y, principal: monthly * 12 * y, balance: bal });
      }
      return rows;
    }
    function run() {
      var monthly = Math.max(0, num($(root, '[name=monthly]'), 1000));
      var rate = Math.min(20, Math.max(0, num($(root, '[name=rate]'), 4)));
      var years = Math.min(50, Math.max(1, Math.round(num($(root, '[name=years]'), 20))));
      var rows = grow(monthly, rate, years);
      var last = rows[rows.length - 1];

      $(root, '[data-out=principal]').textContent = money(last.principal);
      $(root, '[data-out=interest]').textContent = money(last.balance - last.principal);
      $(root, '[data-out=balance]').textContent = money(last.balance);

      var step = Math.max(1, Math.ceil(years / 10));
      var html = '';
      rows.forEach(function (row) {
        if (row.year % step && row.year !== years) return;
        var p = row.principal / last.balance * 100;
        var i = (row.balance - row.principal) / last.balance * 100;
        html += '<div class="hbar"><span>第 ' + row.year + ' 年</span><span class="track">' +
          '<i class="a" style="width:' + p + '%"></i><i class="b" style="width:' + i + '%"></i></span>' +
          '<span>' + fmt(row.balance) + '</span></div>';
      });
      $(root, '[data-out=bars]').innerHTML = html;

      var say = '';
      if (rate > 0) say += '📐 用「72 法則」估算：年利率 ' + rate + '%，錢大約 <b>' + (72 / rate).toFixed(1) + ' 年</b>會變成兩倍。';
      if (years > 10) {
        var late = grow(monthly, rate, years - 10);
        var lateBal = late[late.length - 1].balance;
        say += '<br>⏰ 如果<b>晚 10 年</b>才開始存，到同一天只會有 <b>' + money(lateBal) +
          '</b>，少了 ' + money(last.balance - lateBal) + '。其中本金只少了 ' + money(monthly * 120) + '。';
      }
      $(root, '[data-out=say]').innerHTML = say || '把年數調到 10 年以上，看看「晚 10 年開始」差多少。';
    }
    bind(root, run);
  };

  /* ---------- 通膨 ---------- */
  tools['inflation'] = function (root) {
    function run() {
      var price = Math.max(0, num($(root, '[name=price]'), 60));
      var rate = num($(root, '[name=rate]'), 2);
      var years = Math.max(0, Math.round(num($(root, '[name=years]'), 20)));
      var f = Math.pow(1 + rate / 100, years);
      $(root, '[data-out=future]').textContent = money(price * f);
      $(root, '[data-out=power]').textContent = money(100 / f);
      $(root, '[data-out=say]').innerHTML = years + ' 年後，同一杯飲料大約要 <b>' + fmt(price * f) +
        ' 元</b>。把 100 元藏在抽屜 ' + years + ' 年，拿出來只買得到今天大約 <b>' + fmt(100 / f) + ' 元</b>的東西。';
    }
    bind(root, run);
  };

  /* ---------- 匯率 ---------- */
  tools['fx'] = function (root) {
    function run() {
      var budget = Math.max(0, num($(root, '[name=budget]'), 30000));
      var rate = Math.max(0.01, num($(root, '[name=rate]'), 4.6));
      var item = Math.max(0, num($(root, '[name=item]'), 1200));
      var cases = [
        { k: 'strong', label: '台幣變強（1 元換更多日圓）', r: rate * 1.1 },
        { k: 'now', label: '現在', r: rate },
        { k: 'weak', label: '台幣變弱（1 元換更少日圓）', r: rate * 0.9 }
      ];
      var html = '';
      cases.forEach(function (c) {
        html += '<tr><td>' + c.label + '</td><td class="num">' + c.r.toFixed(2) + '</td><td class="num">' +
          fmt(budget * c.r) + ' 円</td><td class="num">' + fmt(item / c.r) + ' 元</td></tr>';
      });
      $(root, '[data-out=rows]').innerHTML = html;
    }
    bind(root, run);
  };

  /* ---------- 飲料店股東模擬 ---------- */
  tools['shop-shares'] = function (root) {
    var EVENTS = [
      { text: '生意穩定，跟去年差不多', rf: 1.03 },
      { text: '附近的學校增班，客人變多', rf: 1.2 },
      { text: '網紅拍影片推薦，天天大排長龍', rf: 1.35, mood: 1.25 },
      { text: '推出新口味，大受歡迎', rf: 1.15, mood: 1.05 },
      { text: '對面開了一家更便宜的飲料店', rf: 0.8, mood: 0.9 },
      { text: '茶葉和糖漲價，成本變高', fixed: 15000 },
      { text: '房東調漲租金', fixed: 12000 },
      { text: '颱風和雨天特別多，客人暫時變少', temp: 0.85 },
      { text: '別家店爆出食安新聞，大家暫時不敢買飲料', temp: 0.7, mood: 0.8 },
      { text: '買了新的封口機，做飲料變快、省下人力', fixed: -8000 },
      { text: '熱潮退燒，大家開始去別家嘗鮮', rf: 0.85, mood: 0.9 },
      { text: '資深店員離職，出餐變慢、客人抱怨', rf: 0.9 }
    ];
    var SHARES = 10, s;

    function reset() {
      var mine = parseInt($(root, '[name=mine]').value, 10) || 1;
      s = { year: 0, revenue: 200000, fixed: 120000, price: 10000, mine: mine, cost: mine * 10000,
            wallet: 0, losses: 0, closed: false, log: [] };
      render();
    }
    function nextYear() {
      if (s.closed) return;
      var e = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      s.year++;
      s.revenue *= e.rf || 1;
      // 客人不會無限增加：新鮮感退去、對手跟進，營收會慢慢往 20 萬拉回
      s.revenue = 200000 + (s.revenue - 200000) * 0.75;
      s.fixed = Math.max(60000, s.fixed + (e.fixed || 0));
      var profit = Math.round(0.7 * s.revenue * (e.temp || 1) - s.fixed);
      var dividend = 0, old = s.price, fair;
      if (profit > 0) {
        s.losses = 0;
        dividend = Math.round(profit * 0.6 / SHARES);
        fair = profit / SHARES * 5 * (e.mood || 1);
      } else {
        s.losses++;
        fair = old * 0.6 * (e.mood || 1);
      }
      s.price = Math.max(0, Math.round((old * 0.4 + fair * 0.6) / 100) * 100);
      s.wallet += dividend * s.mine;
      var note = '';
      if (s.losses >= 3) {
        s.closed = true;
        s.price = 0;
        note = '連續 3 年賠錢，店收起來了。設備賣掉後，每股只拿回 1,000 元。';
        s.wallet += 1000 * s.mine;
        s.mine = 0;
      }
      s.log.unshift({ year: s.year, text: e.text, profit: profit, dividend: dividend, price: s.price, old: old, note: note });
      render();
    }
    function trade(dir) {
      if (s.closed) return;
      if (dir > 0 && s.wallet >= s.price && s.price > 0 && s.mine < SHARES) { s.wallet -= s.price; s.mine++; s.cost += s.price; }
      if (dir < 0 && s.mine > 0) { s.wallet += s.price; s.mine--; }
      render();
    }
    function render() {
      var total = s.mine * s.price + s.wallet;
      var gain = total - s.cost;
      $(root, '[data-out=year]').textContent = s.year ? '第 ' + s.year + ' 年' : '開店';
      $(root, '[data-out=price]').textContent = money(s.price);
      $(root, '[data-out=mine]').textContent = s.mine + ' / ' + SHARES + ' 股';
      $(root, '[data-out=wallet]').textContent = money(s.wallet);
      $(root, '[data-out=total]').textContent = money(total);
      var g = $(root, '[data-out=gain]');
      g.textContent = (gain >= 0 ? '+' : '−') + fmt(Math.abs(gain)) + ' 元';
      g.parentNode.className = 'stat ' + (gain >= 0 ? 'good' : 'bad');
      $(root, '[data-act=buy]').disabled = s.closed || s.wallet < s.price || s.price <= 0 || s.mine >= SHARES;
      $(root, '[data-act=sell]').disabled = s.closed || s.mine <= 0;
      $(root, '[data-act=next]').disabled = s.closed;

      var rows = s.log.map(function (l) {
        var cls = l.price >= l.old ? 'up' : 'down';
        return '<tr><td>第 ' + l.year + ' 年</td><td class="event">' + esc(l.text) +
          (l.note ? '<br><span class="down">' + esc(l.note) + '</span>' : '') + '</td>' +
          '<td class="num ' + (l.profit >= 0 ? 'up' : 'down') + '">' + money(l.profit) + '</td>' +
          '<td class="num">' + (l.dividend ? fmt(l.dividend) + ' 元' : '沒有') + '</td>' +
          '<td class="num ' + cls + '">' + fmt(l.price) + '（' + (l.price >= l.old ? '▲' : '▼') + fmt(Math.abs(l.price - l.old)) + '）</td></tr>';
      }).join('');
      $(root, '[data-out=log]').innerHTML = rows || '<tr><td colspan="5" class="muted">按「過一年」開始。</td></tr>';
    }
    $(root, '[data-act=next]').addEventListener('click', nextYear);
    $(root, '[data-act=buy]').addEventListener('click', function () { trade(1); });
    $(root, '[data-act=sell]').addEventListener('click', function () { trade(-1); });
    $(root, '[data-act=reset]').addEventListener('click', reset);
    $(root, '[name=mine]').addEventListener('change', reset);
    reset();
  };

  /* ---------- 零用錢預算 ---------- */
  tools['budget'] = function (root) {
    var b = store.budget || {
      allowance: 1500,
      rows: [
        { name: '必要：早餐、文具', amount: 600 },
        { name: '想要：零食、遊戲、飲料', amount: 400 },
        { name: '存下來', amount: 400 },
        { name: '分享：禮物、捐款', amount: 100 }
      ],
      goal: '', goalPrice: 0
    };
    var tbody = $(root, '[data-out=rows]');

    function persist() { store.budget = b; save(store); }
    function draw() {
      tbody.innerHTML = b.rows.map(function (r, i) {
        return '<tr><td><input type="text" data-i="' + i + '" data-k="name" value="' + esc(r.name) + '" aria-label="項目名稱"></td>' +
          '<td><input type="number" min="0" step="10" data-i="' + i + '" data-k="amount" value="' + r.amount + '" aria-label="金額"></td>' +
          '<td><button type="button" data-del="' + i + '" aria-label="刪除這一列">✕</button></td></tr>';
      }).join('');
      calc();
    }
    function calc() {
      var used = b.rows.reduce(function (a, r) { return a + (parseFloat(r.amount) || 0); }, 0);
      var left = b.allowance - used;
      $(root, '[data-out=used]').textContent = money(used);
      $(root, '[data-out=left]').textContent = money(left);
      $(root, '[data-out=left]').parentNode.className = 'stat ' + (left >= 0 ? 'good' : 'bad');
      var saveRow = b.rows.filter(function (r) { return /存/.test(r.name); })[0];
      var monthly = saveRow ? parseFloat(saveRow.amount) || 0 : 0;
      var say;
      if (left < 0) say = '⚠️ 計畫花的錢比零用錢多 ' + fmt(-left) + ' 元，要刪減哪一項？';
      else if (!b.goalPrice) say = '在下面寫一個想買的東西和價格，看看要存幾個月。';
      else if (!monthly) say = '找不到名字裡有「存」的項目，所以算不出要存多久。';
      else say = '🎯 每個月存 ' + fmt(monthly) + ' 元，買「' + esc(b.goal || '目標') + '」需要 <b>' + Math.ceil(b.goalPrice / monthly) + ' 個月</b>。';
      $(root, '[data-out=say]').innerHTML = say;
    }
    $(root, '[name=allowance]').value = b.allowance;
    $(root, '[name=goal]').value = b.goal;
    $(root, '[name=goalPrice]').value = b.goalPrice || '';
    root.addEventListener('input', function (ev) {
      var t = ev.target;
      if (t.name === 'allowance') b.allowance = parseFloat(t.value) || 0;
      else if (t.name === 'goal') b.goal = t.value;
      else if (t.name === 'goalPrice') b.goalPrice = parseFloat(t.value) || 0;
      else if (t.dataset.k) b.rows[t.dataset.i][t.dataset.k] = t.dataset.k === 'amount' ? parseFloat(t.value) || 0 : t.value;
      calc();
      persist();
    });
    root.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t.dataset.del != null) { b.rows.splice(+t.dataset.del, 1); draw(); persist(); }
      if (t.dataset.act === 'add') { b.rows.push({ name: '', amount: 0 }); draw(); persist(); }
    });
    draw();
  };

  /* ---------- 模擬投資紀錄 ---------- */
  tools['portfolio'] = function (root) {
    var START = 100000;
    var p = store.portfolio || { rows: [], snaps: [] };
    var tbody = $(root, '[data-out=rows]');

    function persist() { store.portfolio = p; save(store); }
    function draw() {
      tbody.innerHTML = p.rows.map(function (r, i) {
        function inp(k, type, label) {
          return '<input type="' + type + '" data-i="' + i + '" data-k="' + k + '" value="' + esc(r[k] == null ? '' : r[k]) + '" aria-label="' + label + '"' +
            (type === 'number' ? ' min="0" step="any"' : '') + '>';
        }
        return '<tr><td>' + inp('name', 'text', '公司名稱') + '</td><td>' + inp('why', 'text', '為什麼選它') + '</td>' +
          '<td>' + inp('buy', 'number', '買進價格') + '</td><td>' + inp('qty', 'number', '股數') + '</td>' +
          '<td>' + inp('now', 'number', '目前價格') + '</td><td class="num" data-gain="' + i + '"></td>' +
          '<td><button type="button" data-del="' + i + '" aria-label="刪除這一列">✕</button></td></tr>';
      }).join('') || '<tr><td colspan="7" class="muted">還沒有股票。按「＋ 加一家公司」開始。</td></tr>';
      calc();
      drawSnaps();
    }
    function totals() {
      var cost = 0, value = 0;
      p.rows.forEach(function (r) {
        var q = parseFloat(r.qty) || 0, buy = parseFloat(r.buy) || 0, now = parseFloat(r.now);
        cost += q * buy;
        value += q * (isFinite(now) ? now : buy);
      });
      return { cost: cost, value: value, cash: START - cost, total: START - cost + value };
    }
    function calc() {
      p.rows.forEach(function (r, i) {
        var cell = root.querySelector('[data-gain="' + i + '"]');
        var q = parseFloat(r.qty) || 0, buy = parseFloat(r.buy) || 0, now = parseFloat(r.now);
        if (!cell) return;
        if (!q || !buy || !isFinite(now)) { cell.textContent = '—'; cell.className = 'num'; return; }
        var g = (now - buy) * q;
        cell.textContent = (g >= 0 ? '+' : '−') + fmt(Math.abs(g)) + '（' + ((now - buy) / buy * 100).toFixed(1) + '%）';
        cell.className = 'num ' + (g >= 0 ? 'up' : 'down');
      });
      var t = totals();
      $(root, '[data-out=cash]').textContent = money(t.cash);
      $(root, '[data-out=cash]').parentNode.className = 'stat ' + (t.cash >= 0 ? '' : 'bad');
      $(root, '[data-out=value]').textContent = money(t.value);
      $(root, '[data-out=total]').textContent = money(t.total);
      var g = t.total - START;
      $(root, '[data-out=gain]').textContent = (g >= 0 ? '+' : '−') + fmt(Math.abs(g)) + ' 元（' + (g / START * 100).toFixed(1) + '%）';
      $(root, '[data-out=gain]').parentNode.className = 'stat ' + (g >= 0 ? 'good' : 'bad');
      $(root, '[data-out=warn]').hidden = t.cash >= 0;
    }
    function drawSnaps() {
      var list = $(root, '[data-out=snaps]');
      list.innerHTML = p.snaps.map(function (sn, i) {
        var prev = p.snaps[i - 1];
        var d = prev ? sn.total - prev.total : sn.total - START;
        return '<tr><td>' + esc(sn.date) + '</td><td class="num">' + fmt(sn.total) + ' 元</td><td class="num ' + (d >= 0 ? 'up' : 'down') + '">' +
          (d >= 0 ? '+' : '−') + fmt(Math.abs(d)) + '</td><td><button type="button" data-delsnap="' + i + '" aria-label="刪除這筆紀錄">✕</button></td></tr>';
      }).join('') || '<tr><td colspan="4" class="muted">每個月固定一天（例如每月 1 日）更新「目前價格」，再按「記下這個月」。</td></tr>';
    }
    root.addEventListener('input', function (ev) {
      var t = ev.target;
      if (!t.dataset.k) return;
      p.rows[t.dataset.i][t.dataset.k] = t.type === 'number' ? t.value : t.value;
      calc();
      persist();
    });
    root.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t.dataset.del != null) {
        if (!confirm('要刪除這一家公司的紀錄嗎？')) return;
        p.rows.splice(+t.dataset.del, 1); draw(); persist();
      }
      if (t.dataset.delsnap != null) { p.snaps.splice(+t.dataset.delsnap, 1); drawSnaps(); persist(); }
      if (t.dataset.act === 'add') { p.rows.push({ name: '', why: '', buy: '', qty: '', now: '' }); draw(); persist(); }
      if (t.dataset.act === 'snap') {
        var d = new Date();
        var date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        p.snaps.push({ date: date, total: Math.round(totals().total) });
        drawSnaps(); persist();
      }
    });
    draw();
  };

  document.querySelectorAll('[data-tool]').forEach(function (el) {
    var fn = tools[el.dataset.tool];
    if (fn) fn(el);
  });
})();
