/* 數理邏輯推理：頁面上的三個互動小工具
 * 1. data-tool="prop-grid"：對角線性質表，自己填 ✓／✗ 再對答案
 * 2. data-tool="cases"    ：真假話的假設法，選一個假設，看每句話的真假
 * 3. data-tool="heads"    ：額頭數字探測器，輸入看到的兩個數字，列出自己的可能
 * 純前端，不存任何紀錄。
 */
(function () {
  /* ---------- 1. 對角線性質表 ---------- */
  document.querySelectorAll('[data-tool="prop-grid"]').forEach(function (tool) {
    var cells = Array.prototype.slice.call(tool.querySelectorAll('.cell-btn'));
    var msg = tool.querySelector('.tool-msg');
    var faces = ['?', '✓', '✗'];

    cells.forEach(function (c) {
      c.type = 'button';
      c.dataset.v = '';
      c.textContent = '?';
      c.addEventListener('click', function () {
        var next = (faces.indexOf(c.textContent) + 1) % 3;
        c.textContent = faces[next];
        c.dataset.v = next === 0 ? '' : (next === 1 ? '1' : '0');
        c.classList.remove('is-right', 'is-wrong');
      });
    });

    tool.querySelector('[data-act="check"]').addEventListener('click', function () {
      var blank = 0, wrong = 0;
      cells.forEach(function (c) {
        c.classList.remove('is-right', 'is-wrong');
        if (!c.dataset.v) { blank++; return; }
        if (c.dataset.v === c.dataset.ans) { c.classList.add('is-right'); }
        else { c.classList.add('is-wrong'); wrong++; }
      });
      if (blank) {
        msg.className = 'tool-msg';
        msg.textContent = '還有 ' + blank + ' 格沒填（每格點一下會在 ? → ✓ → ✗ 之間換）。';
      } else if (wrong) {
        msg.className = 'tool-msg no';
        msg.textContent = '有 ' + wrong + ' 格要再想想：畫出對角線，量量看再改。';
      } else {
        msg.className = 'tool-msg ok';
        msg.textContent = '🎉 全部正確！這張表就是第 1 題的鑰匙。';
      }
    });

    tool.querySelector('[data-act="reveal"]').addEventListener('click', function () {
      cells.forEach(function (c) {
        c.dataset.v = c.dataset.ans;
        c.textContent = c.dataset.ans === '1' ? '✓' : '✗';
        c.classList.remove('is-right', 'is-wrong');
      });
      msg.className = 'tool-msg';
      msg.textContent = '這是正確答案，對照一下剛剛哪幾格想錯了。';
    });

    tool.querySelector('[data-act="clear"]').addEventListener('click', function () {
      cells.forEach(function (c) {
        c.dataset.v = ''; c.textContent = '?'; c.classList.remove('is-right', 'is-wrong');
      });
      msg.className = 'tool-msg';
      msg.textContent = '';
    });
  });

  /* ---------- 2. 真假話：假設法檢查表 ---------- */
  document.querySelectorAll('[data-tool="cases"]').forEach(function (tool) {
    var says = JSON.parse(tool.dataset.says);
    var need = parseInt(tool.dataset.need, 10);
    var people = tool.dataset.people.split(',');
    var tabs = tool.querySelector('.case-tabs');
    var out = tool.querySelector('.case-out');

    people.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '假設是「' + p + '」做的';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        tabs.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        render(p);
      });
      tabs.appendChild(b);
    });

    function render(culprit) {
      out.textContent = '';
      var trues = 0;
      says.forEach(function (s) {
        var isTrue = s.t.indexOf(culprit) >= 0;
        if (isTrue) trues++;
        var line = document.createElement('div');
        line.className = 'line';
        var tf = document.createElement('span');
        tf.className = 'tf ' + (isTrue ? 't' : 'f');
        tf.textContent = isTrue ? '真' : '假';
        var txt = document.createElement('span');
        txt.textContent = s.who + '：「' + s.text + '」';
        line.appendChild(tf);
        line.appendChild(txt);
        out.appendChild(line);
      });
      var v = document.createElement('p');
      v.className = 'verdict ' + (trues === need ? 'tool-msg ok' : 'tool-msg no');
      v.textContent = trues === need
        ? '說真話的有 ' + trues + " 人 → 剛好符合「只有 " + need + ' 人說實話」，這個假設活下來了 ✅'
        : '說真話的有 ' + trues + ' 人 → 和題目說的 ' + need + ' 人不合，這個假設出局 ❌';
      out.appendChild(v);
    }

    tabs.querySelector('button').click();
  });

  /* ---------- 3. 額頭數字探測器 ---------- */
  document.querySelectorAll('[data-tool="heads"]').forEach(function (tool) {
    var a = tool.querySelector('[data-in="a"]');
    var b = tool.querySelector('[data-in="b"]');
    var out = tool.querySelector('.cands');
    var msg = tool.querySelector('.tool-msg');

    function card(value, why, dead, reason) {
      var d = document.createElement('div');
      d.className = 'cand' + (dead ? ' dead' : '');
      d.innerHTML = '';
      var n = document.createElement('span');
      n.textContent = value;
      var s = document.createElement('small');
      s.textContent = dead ? why + '（' + reason + '）' : why;
      d.appendChild(n);
      d.appendChild(s);
      return d;
    }

    function run() {
      var x = parseInt(a.value, 10), y = parseInt(b.value, 10);
      out.textContent = '';
      msg.className = 'tool-msg';
      if (!(x > 0) || !(y > 0)) { msg.textContent = '請在兩個格子裡填正整數。'; return; }
      if (x === y) { msg.textContent = '三個數字互不相同，所以看到的兩個數字不會一樣。'; return; }
      var big = Math.max(x, y), small = Math.min(x, y);
      var live = [];

      out.appendChild(card(big + small, '兩數相加 ' + big + ' ＋ ' + small, false, ''));
      live.push(big + small);

      var diff = big - small;
      var dead = diff === small;
      out.appendChild(card(diff, '兩數相減 ' + big + ' － ' + small, dead, '會和 ' + small + ' 重複，三個數字就不是互不相同了'));
      if (!dead) live.push(diff);

      if (live.length === 1) {
        msg.className = 'tool-msg ok';
        msg.textContent = '只剩一種可能 → 他可以立刻說出「我是 ' + live[0] + '」。';
      } else {
        msg.className = 'tool-msg no';
        msg.textContent = '有 ' + live.length + ' 種可能（' + live.join(' 或 ') + '）→ 他還不能立刻回答。';
      }
    }

    a.addEventListener('input', run);
    b.addEventListener('input', run);
    tool.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.dataset.preset.split(',');
        a.value = p[0]; b.value = p[1]; run();
      });
    });
    run();
  });
})();
