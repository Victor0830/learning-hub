/* 國文閱讀力練習室：互動練習
 * - .q[data-answer]：選擇題，點選後立即回饋並顯示解析
 * - .reveal-btn + .answer：看參考答案
 * - textarea[data-note]：自己寫的答案，存在這台裝置的瀏覽器
 * 紀錄只存在 localStorage，不會上傳。
 */
(function () {
  var KEY = 'guowen-reading:v1';
  var page = document.body.dataset.page;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { pages: {} }; }
    catch (e) { return { pages: {} }; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  if (!state.pages) state.pages = {};

  /* ---------- 首頁進度 ---------- */
  document.querySelectorAll('[data-progress]').forEach(function (el) {
    var p = state.pages[el.dataset.progress];
    var text = el.querySelector('.label');
    var bar = el.querySelector('.bar i');
    if (!p || !p.total) { text.textContent = '尚未開始'; return; }
    var done = Object.keys(p.answers || {}).length;
    var right = Object.values(p.answers || {}).filter(function (a) { return a.correct; }).length;
    text.textContent = '選擇題完成 ' + done + ' / ' + p.total + '，答對 ' + right + ' 題';
    bar.style.width = Math.round(done / p.total * 100) + '%';
  });

  if (!page) return;
  var mine = state.pages[page] || (state.pages[page] = { answers: {}, notes: {} });
  mine.answers = mine.answers || {};
  mine.notes = mine.notes || {};

  /* ---------- 選擇題 ---------- */
  var questions = Array.prototype.slice.call(document.querySelectorAll('.q[data-answer]'));
  mine.total = questions.length;
  save(state);

  function updateScore() {
    var done = 0, right = 0;
    questions.forEach(function (q) {
      var a = mine.answers[q.dataset.id];
      if (a) { done++; if (a.correct) right++; }
    });
    document.querySelectorAll('.score').forEach(function (s) {
      s.querySelector('.label').textContent =
        '選擇題：已作答 ' + done + ' / ' + questions.length + ' 題，答對 ' + right + ' 題';
      s.querySelector('.bar i').style.width = (questions.length ? done / questions.length * 100 : 0) + '%';
    });
  }

  questions.forEach(function (q) {
    var id = q.dataset.id;
    var answer = parseInt(q.dataset.answer, 10);
    var opts = Array.prototype.slice.call(q.querySelectorAll('.opt'));
    var explain = q.querySelector('.explain');
    if (explain) explain.hidden = true;
    opts[answer].classList.add('is-answer');

    var fb = document.createElement('p');
    fb.className = 'feedback';
    fb.setAttribute('aria-live', 'polite');
    fb.hidden = true;
    q.insertBefore(fb, explain || null);

    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'retry';
    retry.textContent = '↺ 重新作答';
    retry.hidden = true;
    q.appendChild(retry);

    function show(picked) {
      opts.forEach(function (o, i) {
        o.disabled = true;
        o.classList.toggle('right', i === answer);
        o.classList.toggle('wrong', i === picked && picked !== answer);
      });
      var letter = String.fromCharCode(65 + answer);
      if (picked === answer) {
        fb.textContent = '🎉 答對了！';
        fb.className = 'feedback ok';
      } else {
        fb.textContent = '再想想看：正確答案是 (' + letter + ')，看看下面的解析。';
        fb.className = 'feedback no';
      }
      fb.hidden = false;
      if (explain) explain.hidden = false;
      retry.hidden = false;
    }

    function clear() {
      opts.forEach(function (o) { o.disabled = false; o.classList.remove('right', 'wrong'); });
      fb.hidden = true;
      if (explain) explain.hidden = true;
      retry.hidden = true;
    }

    opts.forEach(function (o, i) {
      o.type = 'button';
      o.addEventListener('click', function () {
        mine.answers[id] = { picked: i, correct: i === answer };
        save(state);
        show(i);
        updateScore();
      });
    });
    retry.addEventListener('click', function () {
      delete mine.answers[id];
      save(state);
      clear();
      updateScore();
      opts[0].focus();
    });

    if (mine.answers[id]) show(mine.answers[id].picked);
  });
  updateScore();

  /* ---------- 參考答案 ---------- */
  document.querySelectorAll('.reveal-btn').forEach(function (btn) {
    var target = btn.nextElementSibling;
    while (target && !target.classList.contains('answer')) target = target.nextElementSibling;
    if (!target) return;
    target.hidden = true;
    btn.type = 'button';
    btn.textContent = '👀 看參考答案';
    btn.addEventListener('click', function () {
      target.hidden = !target.hidden;
      btn.textContent = target.hidden ? '👀 看參考答案' : '🙈 收起答案';
    });
  });

  /* ---------- 自己寫的答案 ---------- */
  document.querySelectorAll('textarea[data-note]').forEach(function (t) {
    var id = t.dataset.note;
    if (mine.notes[id]) t.value = mine.notes[id];
    var timer;
    t.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (t.value.trim()) mine.notes[id] = t.value; else delete mine.notes[id];
        save(state);
      }, 400);
    });
  });

  /* ---------- 工具列 ---------- */
  document.querySelectorAll('[data-action="show-all"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = document.body.classList.toggle('show-all');
      document.querySelectorAll('[data-action="show-all"]').forEach(function (b) {
        b.textContent = on ? '隱藏所有答案' : '顯示所有答案（家長用）';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  });
  document.querySelectorAll('[data-action="reset"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!confirm('要清除這一頁的作答紀錄和寫下的答案嗎？')) return;
      delete state.pages[page];
      save(state);
      location.reload();
    });
  });
  document.querySelectorAll('[data-action="print"]').forEach(function (btn) {
    btn.addEventListener('click', function () { window.print(); });
  });
})();
