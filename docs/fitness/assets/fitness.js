/* 體能訓練：本週打卡、比賽數據計數、動作檢查、每月測驗與趨勢圖。
   所有紀錄只存在這台裝置的 localStorage（fitness-hub:v1）。 */
(function () {
  "use strict";

  var KEY = "fitness-hub:v1";

  /* ---------- 儲存 ---------- */
  function blank() {
    return { names: { p1: "", p2: "" }, who: "p1", week: {}, draft: {}, games: [], clips: [], tests: [] };
  }
  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    var b = blank();
    if (!d || typeof d !== "object") return b;
    Object.keys(b).forEach(function (k) { if (d[k] === undefined) d[k] = b[k]; });
    return d;
  }
  var data = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 無痕模式等情況存不了，頁面照常運作 */ }
  }

  /* ---------- 小工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "cls") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function ym(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function nameOf(p) { return (data.names[p] || "").trim() || (p === "p1" ? "孩子 A" : "孩子 B"); }
  function kidIndex(p) { return p === "p1" ? 1 : 2; }
  function fmt(v) {
    if (v == null || isNaN(v)) return "—";
    return Math.round(v * 100) / 100 + "";
  }
  function pct(m, a) { return a ? Math.round((m / a) * 100) + "%" : "—"; }

  /* ---------- 誰的紀錄 ---------- */
  var whoListeners = [];
  function onWho(fn) { whoListeners.push(fn); }
  function fireWho() { whoListeners.forEach(function (fn) { fn(data.who); }); }

  function renderWhoBars() {
    $$("[data-who-bar]").forEach(function (bar) {
      bar.textContent = "";
      bar.className = "who-bar";
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "記錄誰");
      bar.appendChild(el("b", { text: "記錄誰？" }));
      ["p1", "p2"].forEach(function (p) {
        var btn = el("button", { type: "button", "data-who": p, "aria-pressed": String(data.who === p) },
          [el("span", { cls: "dot k" + kidIndex(p) }), nameOf(p)]);
        btn.addEventListener("click", function () {
          data.who = p; save(); renderWhoBars(); fireWho();
        });
        bar.appendChild(btn);
      });
      var names = el("span", { cls: "names" });
      ["p1", "p2"].forEach(function (p) {
        var inp = el("input", { type: "text", cls: "fit-input name", maxlength: "10", placeholder: p === "p1" ? "孩子 A" : "孩子 B", "aria-label": (p === "p1" ? "第一位" : "第二位") + "的暱稱" });
        inp.value = data.names[p] || "";
        inp.addEventListener("change", function () {
          data.names[p] = inp.value.trim(); save(); renderWhoBars(); fireWho();
        });
        names.appendChild(el("label", null, [el("span", { cls: "dot k" + kidIndex(p) }), inp]));
      });
      bar.appendChild(names);
    });
  }

  /* =========================================================
     1. 本週打卡（training.html）
     ========================================================= */
  var WEEK_ITEMS = [
    { id: "fa", label: "體能 A：變向＋核心" },
    { id: "fb", label: "體能 B：側向＋反覆衝刺" },
    { id: "drib", label: "運球 10 分鐘" },
    { id: "shoot", label: "投籃／上籃腳步" },
    { id: "class", label: "籃球課＋比賽" },
    { id: "rest", label: "完全休息" },
    { id: "pain", label: "⚠️ 有地方痛" }
  ];
  var DAYS = ["一", "二", "三", "四", "五", "六", "日"];
  var weekOffset = 0;

  function mondayOf(offset) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + offset * 7);
    return d;
  }

  function initWeek() {
    var box = $("[data-week]");
    if (!box) return;
    function render() {
      box.textContent = "";
      var mon = mondayOf(weekOffset);
      var key = ymd(mon);
      var who = data.who;
      data.week[who] = data.week[who] || {};
      var wk = data.week[who][key] || {};
      var sun = new Date(mon); sun.setDate(mon.getDate() + 6);

      var head = el("div", { cls: "week-head" }, [
        el("span", { cls: "label", text: nameOf(who) + "｜" + (mon.getMonth() + 1) + "/" + mon.getDate() + "～" + (sun.getMonth() + 1) + "/" + sun.getDate() + (weekOffset === 0 ? "（本週）" : "") })
      ]);
      var prev = el("button", { type: "button", text: "← 上一週" });
      var now = el("button", { type: "button", text: "回到本週" });
      var next = el("button", { type: "button", text: "下一週 →" });
      prev.addEventListener("click", function () { weekOffset--; render(); });
      now.addEventListener("click", function () { weekOffset = 0; render(); });
      next.addEventListener("click", function () { weekOffset++; render(); });
      head.appendChild(prev); head.appendChild(now); head.appendChild(next);
      box.appendChild(head);

      var todayIdx = weekOffset === 0 ? (new Date().getDay() + 6) % 7 : -1;
      var trh = el("tr", null, [el("th", { text: "項目" })]);
      DAYS.forEach(function (dname, i) {
        var dd = new Date(mon); dd.setDate(mon.getDate() + i);
        var th = el("th", { text: dname + " " + (dd.getMonth() + 1) + "/" + dd.getDate() });
        if (i === todayIdx) th.className = "today";
        trh.appendChild(th);
      });
      var tbody = el("tbody");
      WEEK_ITEMS.forEach(function (it) {
        var row = el("tr", null, [el("td", { text: it.label })]);
        var arr = wk[it.id] || [];
        DAYS.forEach(function (dname, i) {
          var cb = el("input", { type: "checkbox", "aria-label": it.label + " 星期" + dname });
          cb.checked = !!arr[i];
          cb.addEventListener("change", function () {
            data.week[who][key] = data.week[who][key] || {};
            var a = data.week[who][key][it.id] || [false, false, false, false, false, false, false];
            a[i] = cb.checked;
            data.week[who][key][it.id] = a;
            save(); render();
          });
          row.appendChild(el("td", null, [cb]));
        });
        tbody.appendChild(row);
      });
      box.appendChild(el("div", { cls: "table-wrap week-table" }, [el("table", null, [el("thead", null, [trh]), tbody])]));

      function count(id) { return (wk[id] || []).filter(Boolean).length; }
      var fit = count("fa") + count("fb");
      var skill = count("drib") + count("shoot");
      var rest = count("rest");
      var pain = count("pain");
      var msg = "本週：體能 " + fit + " 次、技巧練習 " + skill + " 次、籃球課 " + count("class") + " 次、完全休息 " + rest + " 天。";
      var tips = [];
      if (fit > 3) tips.push("體能超過 3 次，這個年紀一週 2～3 次就夠，多的時間拿去睡覺和練球感。");
      if (rest === 0 && weekOffset <= 0 && todayIdx === -1) tips.push("這週沒有完全休息的日子，下週記得排 1～2 天。");
      if (pain >= 2) tips.push("這週有 " + pain + " 天有地方痛。先減少跳躍和衝刺；痛超過一兩天、會跛腳、腫起來或晚上痛，請找運動醫學科或復健科檢查。");
      box.appendChild(el("p", { cls: "week-sum", text: msg }));
      if (tips.length) {
        var c = el("div", { cls: "callout " + (pain >= 2 ? "warn" : "tip") }, [el("span", { cls: "title", text: pain >= 2 ? "⚠️ 注意身體" : "💡 小提醒" })]);
        tips.forEach(function (t) { c.appendChild(el("p", { text: t })); });
        box.appendChild(c);
      }
    }
    render();
    onWho(render);
  }

  /* =========================================================
     2. 比賽數據計數器（video.html）
     ========================================================= */
  var SHOTS = [
    { id: "rim", label: "籃下／上籃" },
    { id: "mid", label: "中遠距離" },
    { id: "ft", label: "罰球" }
  ];
  var COUNTS = [
    { id: "to", label: "失誤", hint: "被抄、走步、傳球出界、帶球撞人", low: true },
    { id: "stl", label: "抄截", hint: "把球搶下來" },
    { id: "defl", label: "碰到球", hint: "有碰到但沒搶到，也算防守積極" },
    { id: "reb", label: "籃板", hint: "進攻＋防守籃板" },
    { id: "ast", label: "助攻", hint: "傳球後隊友直接得分" },
    { id: "fb", label: "快攻先到前場", hint: "轉換時第一個跑過半場" },
    { id: "touch", label: "觸球次數", hint: "拿到球就算一次，看參與度" }
  ];

  function emptyDraft() {
    var d = { s: {}, c: {}, hist: [] };
    SHOTS.forEach(function (s) { d.s[s.id] = { a: 0, m: 0 }; });
    COUNTS.forEach(function (c) { d.c[c.id] = 0; });
    return d;
  }

  function gameFG(g) { return { a: g.s.rim.a + g.s.mid.a, m: g.s.rim.m + g.s.mid.m }; }

  function initGame() {
    var box = $("[data-game]");
    if (!box) return;
    var dateInp = $("[data-game-date]"), minInp = $("[data-game-min]"), noteInp = $("[data-game-note]");
    dateInp.value = ymd(new Date());

    function draft() {
      data.draft[data.who] = data.draft[data.who] || emptyDraft();
      return data.draft[data.who];
    }

    function renderCounter() {
      box.textContent = "";
      var d = draft();
      box.appendChild(el("p", { cls: "muted small", text: "正在記錄：" + nameOf(data.who) + "。邊看影片邊按，重新整理頁面也不會不見，按「存成一場比賽」才會清空。" }));
      var grid1 = el("div", { cls: "tally-grid" });
      SHOTS.forEach(function (s) {
        var st = d.s[s.id];
        var make = el("button", { type: "button", cls: "make", text: "✓ 進" });
        var miss = el("button", { type: "button", cls: "miss", text: "✗ 沒進" });
        var undo = el("button", { type: "button", cls: "undo", text: "↶", "aria-label": s.label + " 復原上一球" });
        make.addEventListener("click", function () { st.a++; st.m++; d.hist.push(["s", s.id, 1]); save(); renderCounter(); });
        miss.addEventListener("click", function () { st.a++; d.hist.push(["s", s.id, 0]); save(); renderCounter(); });
        undo.addEventListener("click", function () {
          for (var i = d.hist.length - 1; i >= 0; i--) {
            var h = d.hist[i];
            if (h[0] === "s" && h[1] === s.id) { st.a--; if (h[2]) st.m--; d.hist.splice(i, 1); break; }
          }
          save(); renderCounter();
        });
        grid1.appendChild(el("div", { cls: "shot" }, [
          el("span", { cls: "t-name", text: s.label }),
          el("span", { cls: "t-rate" }, [st.m + " / " + st.a, el("small", { text: "命中率 " + pct(st.m, st.a) })]),
          el("div", { cls: "btns" }, [make, miss, undo])
        ]));
      });
      box.appendChild(grid1);

      var grid2 = el("div", { cls: "tally-grid" });
      COUNTS.forEach(function (c) {
        var minus = el("button", { type: "button", text: "−", "aria-label": c.label + " 減一" });
        var plus = el("button", { type: "button", cls: "plus", text: "+", "aria-label": c.label + " 加一" });
        minus.addEventListener("click", function () { if (d.c[c.id] > 0) d.c[c.id]--; save(); renderCounter(); });
        plus.addEventListener("click", function () { d.c[c.id]++; save(); renderCounter(); });
        grid2.appendChild(el("div", { cls: "tally" }, [
          el("span", { cls: "t-name" }, [c.label, el("small", { text: c.hint })]),
          minus, el("span", { cls: "t-num", text: String(d.c[c.id]), "aria-live": "polite" }), plus
        ]));
      });
      box.appendChild(grid2);
    }

    $("[data-game-save]").addEventListener("click", function () {
      var d = draft();
      var total = SHOTS.reduce(function (t, s) { return t + d.s[s.id].a; }, 0) + COUNTS.reduce(function (t, c) { return t + d.c[c.id]; }, 0);
      if (!total && !confirm("計數都是 0，還是要存嗎？")) return;
      data.games.push({
        id: uid(), who: data.who, date: dateInp.value || ymd(new Date()),
        min: minInp.value ? Number(minInp.value) : null,
        s: JSON.parse(JSON.stringify(d.s)), c: JSON.parse(JSON.stringify(d.c)),
        note: noteInp.value.trim()
      });
      data.draft[data.who] = emptyDraft();
      noteInp.value = ""; minInp.value = "";
      save(); renderCounter(); renderGames();
      var m = $("[data-game-msg]"); m.textContent = "已存好 ✓"; setTimeout(function () { m.textContent = ""; }, 2500);
    });
    $("[data-game-reset]").addEventListener("click", function () {
      if (!confirm("清空目前正在記錄的數字？（已存的比賽不受影響）")) return;
      data.draft[data.who] = emptyDraft(); save(); renderCounter();
    });

    function renderGames() {
      var list = $("[data-game-list]"), avg = $("[data-game-avg]");
      var games = data.games.filter(function (g) { return g.who === data.who; })
        .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

      list.textContent = ""; avg.textContent = "";
      if (!games.length) {
        list.appendChild(el("p", { cls: "empty", text: nameOf(data.who) + " 還沒有存過比賽紀錄。" }));
        return;
      }
      /* 每場 */
      var th = el("tr", null, ["日期", "投籃（不含罰球）", "罰球", "失誤", "抄截", "碰到球", "籃板", "助攻", "快攻先到", "觸球", ""].map(function (t, i) {
        return el("th", { cls: i > 0 && i < 10 ? "num" : "", text: t });
      }));
      var tb = el("tbody");
      games.slice().reverse().forEach(function (g) {
        var fg = gameFG(g);
        var del = el("button", { type: "button", text: "刪除" });
        del.addEventListener("click", function () {
          if (!confirm("刪除 " + g.date + " 這場紀錄？")) return;
          data.games = data.games.filter(function (x) { return x.id !== g.id; }); save(); renderGames();
        });
        var row = el("tr", null, [
          el("td", { text: g.date + (g.note ? "　" : "") }, g.note ? [el("span", { cls: "muted small", text: g.note })] : []),
          el("td", { cls: "num", text: fg.m + "/" + fg.a + "（" + pct(fg.m, fg.a) + "）" }),
          el("td", { cls: "num", text: g.s.ft.m + "/" + g.s.ft.a })
        ]);
        COUNTS.forEach(function (c) { row.appendChild(el("td", { cls: "num", text: String(g.c[c.id] || 0) })); });
        row.appendChild(el("td", null, [del]));
        tb.appendChild(row);
      });
      list.appendChild(el("div", { cls: "table-wrap log-table" }, [el("table", null, [el("thead", null, [th]), tb])]));

      /* 每月平均 */
      var months = {};
      games.forEach(function (g) {
        var k = g.date.slice(0, 7);
        var m = months[k] = months[k] || { n: 0, fa: 0, fm: 0, ta: 0, tm: 0, c: {} };
        var fg = gameFG(g);
        m.n++; m.fa += fg.a; m.fm += fg.m; m.ta += g.s.ft.a; m.tm += g.s.ft.m;
        COUNTS.forEach(function (c) { m.c[c.id] = (m.c[c.id] || 0) + (g.c[c.id] || 0); });
      });
      var keys = Object.keys(months).sort();
      var th2 = el("tr", null, ["月份", "場數", "投籃命中率", "罰球命中率"].concat(COUNTS.map(function (c) { return c.label; })).map(function (t, i) {
        return el("th", { cls: i > 0 ? "num" : "", text: i > 3 ? t + "／場" : t });
      }));
      var tb2 = el("tbody");
      var prev = null;
      keys.forEach(function (k) {
        var m = months[k];
        var row = el("tr", null, [
          el("td", { text: k }),
          el("td", { cls: "num", text: String(m.n) }),
          el("td", { cls: "num", text: pct(m.fm, m.fa) }),
          el("td", { cls: "num", text: pct(m.tm, m.ta) })
        ]);
        COUNTS.forEach(function (c) {
          var v = m.c[c.id] / m.n;
          var td = el("td", { cls: "num", text: fmt(Math.round(v * 10) / 10) });
          if (prev) {
            var pv = prev.c[c.id] / prev.n, diff = Math.round((v - pv) * 10) / 10;
            if (diff !== 0) {
              var better = c.low ? diff < 0 : diff > 0;
              td.appendChild(el("span", { cls: "delta " + (better ? "up" : "down"), text: (diff > 0 ? "▲" : "▼") + Math.abs(diff) }));
            }
          }
          row.appendChild(td);
        });
        tb2.appendChild(row);
        prev = m;
      });
      avg.appendChild(el("div", { cls: "table-wrap log-table" }, [el("table", null, [el("thead", null, [th2]), tb2])]));
      avg.appendChild(el("p", { cls: "muted small", text: "▲▼ 是和上個月比；綠色代表往好的方向（失誤是變少才算好）。一個月只有一兩場時，數字起伏很正常，看 3 個月以上的方向。" }));
    }

    renderCounter(); renderGames();
    onWho(function () { renderCounter(); renderGames(); });
  }

  /* =========================================================
     3. 動作檢查清單（video.html）
     ========================================================= */
  var CHECKS = {
    shoot: { label: "🏀 投籃姿勢", items: [
      ["雙腳站穩，腳尖大致對著籃框", "與肩同寬，投籃手那一側的腳可以稍微前面一點"],
      ["膝蓋先彎，力量從腿往上傳", "不是只靠手臂推球"],
      ["手肘在球的正下方，對著籃框", "從正面看，手肘沒有往外張開"],
      ["每一球的出手點都差不多", "大約在額頭前上方"],
      ["出手後手腕下壓、停住", "像把手伸進籃框裡的餅乾罐"],
      ["落地在起跳的位置附近，身體平衡", "沒有往前、往旁邊飄"]
    ] },
    dribble: { label: "✋ 運球", items: [
      ["眼睛看前方，不看球", "可以看到隊友和防守的人"],
      ["用手指和指腹控球，不是用手掌拍", ""],
      ["球的高度在腰部以下", "有人防守時更低"],
      ["弱手也敢運、敢變向", ""],
      ["變向之後有加速離開", "不是換完手又停在原地"],
      ["用身體和另一隻手護球", ""]
    ] },
    layup: { label: "🏃 上籃", items: [
      ["最後兩步的節奏正確", "右手上籃：右腳→左腳起跳；左手上籃相反"],
      ["往上跳，不是往前撞", ""],
      ["用遠離防守者的那隻手放球", ""],
      ["有看擦板點，放球輕", ""],
      ["左右兩邊都能完成", ""],
      ["沒有走步", ""]
    ] },
    defense: { label: "🛡️ 防守", items: [
      ["重心低、膝蓋彎，隨時能移動", ""],
      ["滑步時兩腳不交叉、不併腳", ""],
      ["一直站在「對手和籃框」之間", ""],
      ["手張開干擾傳球和運球", ""],
      ["同時看得到球和自己防守的人", ""],
      ["對手出手後會卡位搶籃板", ""]
    ] },
    transition: { label: "⚡ 攻守轉換（比賽中）", items: [
      ["搶到球或抄到球，第一時間往前衝", "這是短跑速度最直接的用途"],
      ["快攻時跑在邊線附近，把場地拉開", ""],
      ["丟球或失分後馬上回防，不停下來抱怨", ""],
      ["沒拿球時也會移動找空檔", ""],
      ["會出聲跟隊友溝通（喊人、喊換防）", ""]
    ] }
  };
  var RATE_LABELS = ["還沒做到", "有時做到", "穩定做到"];

  function initClips() {
    var box = $("[data-clip]");
    if (!box) return;
    var sel = $("[data-clip-drill]"), dateInp = $("[data-clip-date]"), noteInp = $("[data-clip-note]");
    Object.keys(CHECKS).forEach(function (k) { sel.appendChild(el("option", { value: k, text: CHECKS[k].label })); });
    dateInp.value = ymd(new Date());
    var ratings = [];

    function renderList() {
      box.textContent = "";
      var def = CHECKS[sel.value];
      ratings = def.items.map(function () { return null; });
      var ol = el("ol", { cls: "check-list" });
      def.items.forEach(function (it, i) {
        var rate = el("div", { cls: "rate", role: "group", "aria-label": it[0] });
        RATE_LABELS.forEach(function (lab, v) {
          var b = el("button", { type: "button", "data-v": String(v), "aria-pressed": "false", text: lab });
          b.addEventListener("click", function () {
            ratings[i] = v;
            $$("button", rate).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          });
          rate.appendChild(b);
        });
        ol.appendChild(el("li", { cls: "check-item" }, [
          el("span", { cls: "ck-text" }, [it[0]].concat(it[1] ? [el("small", { text: it[1] })] : [])),
          rate
        ]));
      });
      box.appendChild(ol);
    }
    sel.addEventListener("change", renderList);

    $("[data-clip-save]").addEventListener("click", function () {
      var done = ratings.filter(function (r) { return r !== null; }).length;
      if (!done) { alert("先替至少一項打分數。"); return; }
      if (done < ratings.length && !confirm("還有 " + (ratings.length - done) + " 項沒打分數（會當成沒看到），要存嗎？")) return;
      data.clips.push({ id: uid(), who: data.who, date: dateInp.value || ymd(new Date()), drill: sel.value, r: ratings.slice(), note: noteInp.value.trim() });
      noteInp.value = "";
      save(); renderList(); renderClips();
      var m = $("[data-clip-msg]"); m.textContent = "已存好 ✓"; setTimeout(function () { m.textContent = ""; }, 2500);
    });

    function score(c) {
      var got = 0, n = 0;
      c.r.forEach(function (v) { if (v !== null) { got += v; n++; } });
      return n ? Math.round((got / (n * 2)) * 100) : null;
    }

    function renderClips() {
      var list = $("[data-clip-list]");
      list.textContent = "";
      var clips = data.clips.filter(function (c) { return c.who === data.who && CHECKS[c.drill]; })
        .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
      if (!clips.length) { list.appendChild(el("p", { cls: "empty", text: nameOf(data.who) + " 還沒有存過動作檢查。" })); return; }
      var lastByDrill = {};
      var rows = clips.map(function (c) {
        var s = score(c), prev = lastByDrill[c.drill];
        lastByDrill[c.drill] = s;
        return { c: c, s: s, prev: prev };
      }).reverse();
      var th = el("tr", null, ["日期", "項目", "分數", "還沒做到的地方", ""].map(function (t, i) { return el("th", { cls: i === 2 ? "num" : "", text: t }); }));
      var tb = el("tbody");
      rows.forEach(function (r) {
        var c = r.c, def = CHECKS[c.drill];
        var weak = def.items.filter(function (it, i) { return c.r[i] === 0; }).map(function (it) { return it[0]; });
        var scoreTd = el("td", { cls: "num", text: r.s == null ? "—" : r.s + "%" });
        if (r.prev != null && r.s != null && r.s !== r.prev) {
          var d = r.s - r.prev;
          scoreTd.appendChild(el("span", { cls: "delta " + (d > 0 ? "up" : "down"), text: (d > 0 ? "▲" : "▼") + Math.abs(d) }));
        }
        var del = el("button", { type: "button", text: "刪除" });
        del.addEventListener("click", function () {
          if (!confirm("刪除這筆動作檢查？")) return;
          data.clips = data.clips.filter(function (x) { return x.id !== c.id; }); save(); renderClips();
        });
        var weakTd = el("td", { text: weak.length ? weak.join("；") : "（沒有）" });
        if (c.note) weakTd.appendChild(el("div", { cls: "muted small", text: "備註：" + c.note }));
        tb.appendChild(el("tr", null, [el("td", { text: c.date }), el("td", { text: def.label }), scoreTd, weakTd, el("td", null, [del])]));
      });
      list.appendChild(el("div", { cls: "table-wrap log-table" }, [el("table", null, [el("thead", null, [th]), tb])]));
      list.appendChild(el("p", { cls: "muted small", text: "分數＝穩定做到算 2 分、有時做到 1 分、還沒做到 0 分，換算成百分比。▲▼ 是和上一次同一個項目比。" }));
    }

    renderList(); renderClips();
    onWho(renderClips);
  }

  /* =========================================================
     4. 每月測驗與趨勢圖（tests.html）
     ========================================================= */
  var METRICS = [
    { id: "height", label: "身高", unit: "公分", step: "0.1", note: "觀察是不是在快速長高期" },
    { id: "vjump", label: "垂直跳", unit: "公分", step: "1", better: "high" },
    { id: "sprint20", label: "20 公尺衝刺", unit: "秒", step: "0.01", better: "low" },
    { id: "agility", label: "5-10-5 折返跑", unit: "秒", step: "0.01", better: "low" },
    { id: "weakdrib", label: "弱手運球 30 秒掉球", unit: "次", step: "1", better: "low" },
    { id: "ft20", label: "罰球 20 投命中", unit: "球", step: "1", better: "high", max: 20 },
    { id: "spot50", label: "5 點投籃 50 投命中", unit: "球", step: "1", better: "high", max: 50 },
    { id: "court5", label: "全場折返 5 趟", unit: "秒", step: "0.1", better: "low" }
  ];

  function initTests() {
    var form = $("[data-test-form]");
    if (!form) return;
    var monthInp = $("[data-test-month]"), noteInp = $("[data-test-note]");
    monthInp.value = ym(new Date());
    var fields = $("[data-test-fields]");
    var inputs = {};
    METRICS.forEach(function (m) {
      var inp = el("input", { type: "number", inputmode: "decimal", min: "0", step: m.step, cls: "fit-input", style: "width:7em" });
      if (m.max) inp.setAttribute("max", String(m.max));
      inputs[m.id] = inp;
      fields.appendChild(el("label", null, [m.label + "（" + m.unit + "）", inp]));
    });

    function fillForm() {
      var t = data.tests.filter(function (x) { return x.who === data.who && x.month === monthInp.value; })[0];
      METRICS.forEach(function (m) { inputs[m.id].value = t && t.v[m.id] != null ? t.v[m.id] : ""; });
      noteInp.value = t ? t.note || "" : "";
      $("[data-test-status]").textContent = t ? "（這個月已經有紀錄，儲存會更新它）" : "";
      $("[data-test-who]").textContent = nameOf(data.who);
    }
    monthInp.addEventListener("change", fillForm);

    $("[data-test-save]").addEventListener("click", function () {
      if (!monthInp.value) { alert("先選月份。"); return; }
      var v = {}, any = false;
      METRICS.forEach(function (m) {
        var raw = inputs[m.id].value;
        if (raw !== "" && !isNaN(Number(raw))) { v[m.id] = Number(raw); any = true; }
      });
      if (!any) { alert("至少填一項。"); return; }
      data.tests = data.tests.filter(function (x) { return !(x.who === data.who && x.month === monthInp.value); });
      data.tests.push({ id: uid(), who: data.who, month: monthInp.value, v: v, note: noteInp.value.trim() });
      save(); fillForm(); renderTable(); renderChart();
      var msg = $("[data-test-msg]"); msg.textContent = "已存好 ✓"; setTimeout(function () { msg.textContent = ""; }, 2500);
    });

    function testsOf(p) {
      return data.tests.filter(function (x) { return x.who === p; }).sort(function (a, b) { return a.month < b.month ? -1 : 1; });
    }

    function renderTable() {
      var box = $("[data-test-table]");
      box.textContent = "";
      var rows = testsOf(data.who);
      if (!rows.length) { box.appendChild(el("p", { cls: "empty", text: nameOf(data.who) + " 還沒有測驗紀錄。" })); return; }
      var th = el("tr", null, [el("th", { text: "月份" })].concat(METRICS.map(function (m) {
        return el("th", { cls: "num", text: m.label + "（" + m.unit + "）" });
      })).concat([el("th", { text: "" })]));
      var tb = el("tbody");
      var last = {};
      var built = rows.map(function (t) {
        var row = el("tr", null, [el("td", { text: t.month }, t.note ? [el("div", { cls: "muted small", text: t.note })] : [])]);
        METRICS.forEach(function (m) {
          var v = t.v[m.id];
          var td = el("td", { cls: "num", text: v == null ? "—" : fmt(v) });
          if (v != null && last[m.id] != null && m.better) {
            var d = Math.round((v - last[m.id]) * 100) / 100;
            var good = m.better === "high" ? d > 0 : d < 0;
            td.appendChild(el("span", { cls: "delta " + (d === 0 ? "same" : good ? "up" : "down"), text: d === 0 ? "＝" : (d > 0 ? "▲" : "▼") + Math.abs(d) }));
          } else if (v != null && last[m.id] != null && !m.better) {
            var dh = Math.round((v - last[m.id]) * 10) / 10;
            td.appendChild(el("span", { cls: "delta same", text: (dh >= 0 ? "+" : "") + dh }));
          }
          if (v != null) last[m.id] = v;
          row.appendChild(td);
        });
        var del = el("button", { type: "button", text: "刪除" });
        del.addEventListener("click", function () {
          if (!confirm("刪除 " + t.month + " 的測驗紀錄？")) return;
          data.tests = data.tests.filter(function (x) { return x.id !== t.id; }); save(); fillForm(); renderTable(); renderChart();
        });
        row.appendChild(el("td", null, [del]));
        return row;
      });
      built.reverse().forEach(function (r) { tb.appendChild(r); });
      box.appendChild(el("div", { cls: "table-wrap log-table" }, [el("table", null, [el("thead", null, [th]), tb])]));
    }

    /* ---------- 趨勢圖 ---------- */
    var metricSel = $("[data-chart-metric]");
    METRICS.forEach(function (m) { metricSel.appendChild(el("option", { value: m.id, text: m.label + "（" + m.unit + "）" })); });
    metricSel.value = "sprint20";
    var shown = { p1: true, p2: true };
    var SVGNS = "http://www.w3.org/2000/svg";
    function s(tag, attrs) {
      var n = document.createElementNS(SVGNS, tag);
      Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    function monthNum(k) { var p = k.split("-"); return Number(p[0]) * 12 + Number(p[1]) - 1; }
    function niceTicks(lo, hi, count) {
      var span = hi - lo || Math.abs(hi) || 1;
      var raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
      var stepN = [1, 2, 2.5, 5, 10].map(function (f) { return f * mag; }).filter(function (v) { return v >= raw; })[0];
      var start = Math.floor(lo / stepN) * stepN, end = Math.ceil(hi / stepN) * stepN;
      if (start === end) { start -= stepN; end += stepN; }
      var out = [];
      for (var v = start; v <= end + stepN / 2; v += stepN) out.push(Math.round(v * 1000) / 1000);
      return out;
    }

    function renderChart() {
      var m = METRICS.filter(function (x) { return x.id === metricSel.value; })[0];
      var wrap = $("[data-chart]"), legend = $("[data-chart-legend]"), sub = $("[data-chart-sub]"), tbl = $("[data-chart-table]");
      wrap.textContent = ""; legend.textContent = ""; tbl.textContent = "";
      sub.textContent = m.better === "low" ? "數字越小越好（越快、越少掉球）。" : m.better === "high" ? "數字越大越好。" : "身高不分好壞，用來對照：快速長高的那幾個月，其他成績暫時停住很正常。";

      var series = ["p1", "p2"].map(function (p) {
        return { p: p, name: nameOf(p), pts: testsOf(p).filter(function (t) { return t.v[m.id] != null; }).map(function (t) { return { k: t.month, x: monthNum(t.month), y: t.v[m.id] }; }) };
      });
      ["p1", "p2"].forEach(function (p, i) {
        var b = el("button", { type: "button", "aria-pressed": String(shown[p]) }, [el("span", { cls: "dot k" + (i + 1) }), series[i].name]);
        b.addEventListener("click", function () { shown[p] = !shown[p]; renderChart(); });
        legend.appendChild(b);
      });

      var vis = series.filter(function (sr) { return shown[sr.p] && sr.pts.length; });
      var allMonths = {};
      series.forEach(function (sr) { sr.pts.forEach(function (pt) { allMonths[pt.k] = pt.x; }); });

      /* 數字表（圖的替代） */
      var mk = Object.keys(allMonths).sort();
      if (mk.length) {
        var th = el("tr", null, [el("th", { text: "月份" })].concat(series.map(function (sr) { return el("th", { cls: "num", text: sr.name }); })));
        var tb = el("tbody");
        mk.forEach(function (k) {
          tb.appendChild(el("tr", null, [el("td", { text: k })].concat(series.map(function (sr) {
            var pt = sr.pts.filter(function (x) { return x.k === k; })[0];
            return el("td", { cls: "num", text: pt ? fmt(pt.y) : "—" });
          }))));
        });
        tbl.appendChild(el("div", { cls: "table-wrap log-table" }, [el("table", null, [el("thead", null, [th]), tb])]));
      }

      if (!vis.length) {
        wrap.appendChild(el("p", { cls: "empty", text: "還沒有「" + m.label + "」的紀錄。每個月測一次，存兩個月以上就會畫出線。" }));
        return;
      }

      var W = Math.max(300, wrap.clientWidth || 600), H = 250;
      var padL = 46, padR = 86, padT = 14, padB = 30;
      var xs = [], ys = [];
      vis.forEach(function (sr) { sr.pts.forEach(function (pt) { xs.push(pt.x); ys.push(pt.y); }); });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      if (x0 === x1) { x0 -= 1; x1 += 1; }
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
      var padY = (hi - lo) * 0.15 || Math.abs(hi) * 0.05 || 1;
      var ticks = niceTicks(lo - padY, hi + padY, 4);
      var y0 = ticks[0], y1 = ticks[ticks.length - 1];
      function X(v) { return padL + (v - x0) / (x1 - x0) * (W - padL - padR); }
      function Y(v) { return padT + (1 - (v - y0) / (y1 - y0)) * (H - padT - padB); }

      var svg = s("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": m.label + "趨勢圖" });
      var grid = s("g", { "class": "grid" }), axis = s("g", { "class": "axis" });
      ticks.forEach(function (t) {
        grid.appendChild(s("line", { x1: padL, x2: W - padR, y1: Y(t), y2: Y(t) }));
        var tx = s("text", { x: padL - 8, y: Y(t) + 4, "text-anchor": "end" }); tx.textContent = fmt(t); axis.appendChild(tx);
      });
      /* x 軸：月份，太多時隔幾個標一次 */
      var monthsInView = [];
      for (var v = Math.ceil(x0); v <= Math.floor(x1); v++) monthsInView.push(v);
      var every = Math.max(1, Math.ceil(monthsInView.length / Math.max(2, Math.floor((W - padL - padR) / 64))));
      monthsInView.forEach(function (v, i) {
        if (i % every) return;
        var yy = Math.floor(v / 12), mm = v % 12 + 1;
        var tx = s("text", { x: X(v), y: H - 8, "text-anchor": "middle" });
        tx.textContent = mm === 1 || i === 0 ? yy + "/" + mm : mm + "月";
        axis.appendChild(tx);
      });
      svg.appendChild(grid); svg.appendChild(axis);

      var labels = [];
      vis.forEach(function (sr) {
        var color = "var(--kid" + kidIndex(sr.p) + ")";
        var g = s("g", { "class": "series" });
        if (sr.pts.length > 1) {
          g.appendChild(s("path", { d: sr.pts.map(function (pt, i) { return (i ? "L" : "M") + X(pt.x).toFixed(1) + " " + Y(pt.y).toFixed(1); }).join(" "), style: "stroke:" + color }));
        }
        sr.pts.forEach(function (pt) { g.appendChild(s("circle", { cx: X(pt.x), cy: Y(pt.y), r: 4.5, style: "fill:" + color })); });
        svg.appendChild(g);
        var lastPt = sr.pts[sr.pts.length - 1];
        labels.push({ x: X(lastPt.x) + 9, y: Y(lastPt.y) + 4, text: sr.name + " " + fmt(lastPt.y) });
      });
      /* 兩個標籤太近時上下錯開 */
      if (labels.length === 2 && Math.abs(labels[0].y - labels[1].y) < 15 && Math.abs(labels[0].x - labels[1].x) < 60) {
        var top = labels[0].y <= labels[1].y ? 0 : 1, mid = (labels[0].y + labels[1].y) / 2;
        labels[top].y = mid - 8; labels[1 - top].y = mid + 8;
      }
      labels.forEach(function (lb) {
        var t = s("text", { x: lb.x, y: lb.y, "class": "end-label" }); t.textContent = lb.text; svg.appendChild(t);
      });

      var cross = s("line", { "class": "cross", y1: padT, y2: H - padB, visibility: "hidden" });
      svg.appendChild(cross);
      var hit = s("rect", { x: padL, y: padT, width: W - padL - padR, height: H - padT - padB, fill: "transparent", tabindex: "0", "aria-label": "移動游標或用左右鍵查看每個月的數字" });
      svg.appendChild(hit);
      wrap.appendChild(svg);
      var tip = el("div", { cls: "chart-tip", hidden: "" });
      wrap.appendChild(tip);

      var keysSorted = Object.keys(allMonths).filter(function (k) {
        return vis.some(function (sr) { return sr.pts.some(function (pt) { return pt.k === k; }); });
      }).sort();
      var cur = -1;
      function show(idx) {
        if (idx < 0 || idx >= keysSorted.length) return;
        cur = idx;
        var k = keysSorted[idx], xv = X(allMonths[k]);
        cross.setAttribute("x1", xv); cross.setAttribute("x2", xv); cross.setAttribute("visibility", "visible");
        tip.textContent = "";
        tip.appendChild(el("div", { cls: "tip-date", text: k }));
        vis.forEach(function (sr) {
          var pt = sr.pts.filter(function (p) { return p.k === k; })[0];
          tip.appendChild(el("div", null, [el("span", { cls: "dot k" + kidIndex(sr.p) }), el("b", { text: pt ? fmt(pt.y) + " " + m.unit : "—" }), " " + sr.name]));
        });
        tip.hidden = false;
        var scale = wrap.clientWidth / W;
        var left = xv * scale + 12;
        if (left + tip.offsetWidth > wrap.clientWidth) left = xv * scale - tip.offsetWidth - 12;
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = (padT * scale) + "px";
      }
      function hide() { cross.setAttribute("visibility", "hidden"); tip.hidden = true; }
      hit.addEventListener("pointermove", function (e) {
        var rect = svg.getBoundingClientRect();
        var px = (e.clientX - rect.left) * (W / rect.width);
        var best = 0, bd = Infinity;
        keysSorted.forEach(function (k, i) { var d = Math.abs(X(allMonths[k]) - px); if (d < bd) { bd = d; best = i; } });
        show(best);
      });
      hit.addEventListener("pointerleave", hide);
      hit.addEventListener("focus", function () { show(cur >= 0 ? cur : keysSorted.length - 1); });
      hit.addEventListener("blur", hide);
      hit.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); show(Math.max(0, cur - 1)); }
        if (e.key === "ArrowRight") { e.preventDefault(); show(Math.min(keysSorted.length - 1, cur + 1)); }
      });
    }
    metricSel.addEventListener("change", renderChart);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderChart, 150); });

    fillForm(); renderTable(); renderChart();
    onWho(function () { fillForm(); renderTable(); renderChart(); });
  }

  /* =========================================================
     5. 備份與還原
     ========================================================= */
  function initBackup() {
    $$("[data-backup]").forEach(function (box) {
      var exp = el("button", { type: "button", text: "⬇️ 下載備份檔" });
      var file = el("input", { type: "file", accept: "application/json,.json", hidden: "" });
      var imp = el("button", { type: "button", text: "⬆️ 從備份檔還原" });
      var msg = el("span", { cls: "saved-msg" });
      exp.addEventListener("click", function () {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = el("a", { href: URL.createObjectURL(blob), download: "體能訓練紀錄-" + ymd(new Date()) + ".json" });
        document.body.appendChild(a); a.click(); a.remove();
      });
      imp.addEventListener("click", function () { file.click(); });
      file.addEventListener("change", function () {
        var f = file.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var d = JSON.parse(r.result);
            if (!d || !Array.isArray(d.tests) || !Array.isArray(d.games)) throw new Error("format");
            if (!confirm("還原會用備份檔取代這台裝置目前的體能紀錄，確定嗎？")) return;
            localStorage.setItem(KEY, JSON.stringify(d));
            location.reload();
          } catch (e) { msg.textContent = "這不是體能訓練的備份檔。"; }
        };
        r.readAsText(f);
      });
      box.appendChild(el("div", { cls: "form-row" }, [exp, imp, file, msg]));
    });
  }

  renderWhoBars();
  initWeek();
  initGame();
  initClips();
  initTests();
  initBackup();
})();
