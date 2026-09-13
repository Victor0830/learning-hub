/* 英文聽說練習：聽說工具
 * - [data-voicebar]：選英文語音和速度
 * - [data-say]：🔊 播放英文（電腦語音）
 * - .shadow：跟讀（逐句播放、隱藏文字／重音／連音、錄音對照、語音辨識檢查、步驟打勾）
 * - .dict：聽寫（播放、輸入、逐字比對、解析）
 * - .pair-quiz：最小對比音辨音遊戲
 * - [data-recorder]：錄音，可存進這台裝置的錄音檔案夾（IndexedDB）
 * - [data-listen]：語音辨識，看看自己說了什麼、說得多快
 * - .timer432：4-3-2 計時
 * - [data-rec-list]：錄音檔案夾
 * - [data-checkup-save] / [data-checkup-history]：每月聽寫成績紀錄
 * 紀錄只存在這台裝置；語音辨識由瀏覽器提供（可能會把聲音傳到 Google 或 Apple 的伺服器辨識）。
 */
(function () {
  var KEY = 'english-talk:tools:v1';
  var QUIZ_KEY = 'guowen-reading:v1';
  var page = document.body.dataset.page;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  var state = load();
  ['settings', 'shadow', 'dict', 'pairs', 'dictTotals'].forEach(function (k) { state[k] = state[k] || {}; });
  state.checkups = state.checkups || [];

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + pad(sec % 60); }

  function h(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, '');
      else if (v !== false && v != null) node.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function btn(label, onclick, cls) {
    return h('button', { type: 'button', className: cls || '', text: label, onclick: onclick });
  }

  /* ================= 電腦語音 ================= */
  var synth = window.speechSynthesis;
  var NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox/i;
  var PREFERRED = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Guy', 'Ava', 'Allison', 'Alex', 'Google UK English Female', 'Karen', 'Daniel'];

  function englishVoices() {
    if (!synth) return [];
    return synth.getVoices()
      .filter(function (v) { return /^en[-_]/i.test(v.lang) && !NOVELTY.test(v.name); })
      .sort(function (a, b) { return rank(a) - rank(b); });
  }
  function rank(v) {
    var i = -1;
    PREFERRED.some(function (p, k) { if (v.name.indexOf(p) === 0) { i = k; return true; } return false; });
    var score = i === -1 ? 60 : i;
    if (/Enhanced|Premium|Natural|Neural/i.test(v.name)) score -= 30;
    if (!/^en[-_]US/i.test(v.lang)) score += 40;
    return score;
  }
  function currentVoice() {
    var list = englishVoices();
    var saved = state.settings.voice;
    return list.filter(function (v) { return v.name === saved; })[0] || list[0] || null;
  }
  function currentRate() { return state.settings.rate || 0.85; }

  var speakToken = 0;
  var liveUtterances = [];
  function stopSpeech() {
    speakToken++;
    if (synth) synth.cancel();
  }
  // 依序唸出多個句子；opts.onEach(i) 開始唸第 i 句、opts.gap(i, ms) 回傳句間停頓、opts.onDone()
  function speakList(texts, opts) {
    opts = opts || {};
    if (!synth) { alert('這個瀏覽器不支援電腦語音，請改用 Chrome 或 Safari。'); return; }
    stopSpeech();
    var my = speakToken;
    liveUtterances = [];
    function next(i) {
      if (my !== speakToken) return;
      if (i >= texts.length) { if (opts.onDone) opts.onDone(); return; }
      var u = new SpeechSynthesisUtterance(texts[i]);
      var v = currentVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'en-US';
      u.rate = opts.rate || currentRate();
      var t0 = 0;
      u.onstart = function () { t0 = Date.now(); if (my === speakToken && opts.onEach) opts.onEach(i); };
      u.onend = u.onerror = function () {
        if (my !== speakToken) return;
        if (u.done) return;
        u.done = true;
        var ms = t0 ? Date.now() - t0 : 1500;
        setTimeout(function () { next(i + 1); }, opts.gap ? opts.gap(i, ms) : 200);
      };
      liveUtterances.push(u);
      synth.speak(u);
    }
    setTimeout(function () { next(0); }, 60);
  }
  function speak(text, opts) {
    speakList([text], opts);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-say]');
    if (!b) return;
    e.preventDefault();
    var rate = b.dataset.rate ? parseFloat(b.dataset.rate) : null;
    speak(b.dataset.say, { rate: rate });
  });
  document.querySelectorAll('[data-say]').forEach(function (b) {
    if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', '播放英文：' + b.dataset.say);
    if (b.tagName === 'BUTTON') b.type = 'button';
  });

  document.querySelectorAll('[data-voicebar]').forEach(function (bar) {
    if (!synth) {
      bar.innerHTML = '⚠️ 這個瀏覽器不支援電腦語音，請改用 <b>Chrome</b> 或 <b>Safari</b>。';
      return;
    }
    var voiceSel = h('select', { 'aria-label': '英文語音' });
    var rateSel = h('select', { 'aria-label': '語速' });
    [[0.7, '🐢 慢'], [0.85, '稍慢'], [1, '正常']].forEach(function (r) {
      var o = h('option', { value: r[0], text: r[1] });
      if (r[0] === currentRate()) o.selected = true;
      rateSel.appendChild(o);
    });
    rateSel.addEventListener('change', function () { state.settings.rate = parseFloat(rateSel.value); save(); });
    voiceSel.addEventListener('change', function () { state.settings.voice = voiceSel.value; save(); });
    var warn = h('span', { className: 'small muted' });
    function fill() {
      var list = englishVoices();
      var cur = currentVoice();
      voiceSel.innerHTML = '';
      list.forEach(function (v) {
        var o = h('option', { value: v.name, text: v.name + '（' + v.lang + '）' });
        if (cur && v.name === cur.name) o.selected = true;
        voiceSel.appendChild(o);
      });
      warn.textContent = list.length ? '' : '找不到英文語音，請在系統設定裡下載英文語音。';
    }
    fill();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', fill);
    else synth.onvoiceschanged = fill;
    bar.appendChild(h('span', { className: 'vb-title', text: '🔊 電腦語音' }));
    bar.appendChild(h('label', {}, ['聲音', voiceSel]));
    bar.appendChild(h('label', {}, ['速度', rateSel]));
    bar.appendChild(btn('試聽', function () { speak('Hi! Let\'s practice English together.'); }));
    bar.appendChild(warn);
  });

  /* ================= 比對文字 ================= */
  var CONTRACTIONS = {
    "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is', "she's": 'she is',
    "it's": 'it is', "that's": 'that is', "what's": 'what is', "there's": 'there is', "here's": 'here is', "let's": 'let us',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', 'cannot': 'can not', "won't": 'will not',
    "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "couldn't": 'could not', "shouldn't": 'should not',
    "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will', "it'll": 'it will', "we'll": 'we will', "they'll": 'they will',
    "i'd": 'i would', "you'd": 'you would', "he'd": 'he would', "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
    'wanna': 'want to', 'gonna': 'going to', 'gotta': 'got to', 'kinda': 'kind of', 'dunno': 'do not know'
  };
  var NUMS = { '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '100': 'hundred' };
  // 語音辨識比較寬鬆：同音字、拼法不同都算對
  var LOOSE_WORD = { "it's": 'its', 'its': 'its', 'honeybee': 'honey bee', 'honeybees': 'honey bees', 'okay': 'ok' };
  var LOOSE_PART = { 'two': 'to', 'too': 'to', 'four': 'for', 'their': 'there', "they're": 'there', 'colour': 'color', 'colours': 'colors', 'eye': 'i', 'hour': 'our', 'won': 'one', 'right': 'write', 'see': 'sea', 'hi': 'high' };

  function keysOf(word, loose) {
    var w = word.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
    if (!w) return [];
    var full = (loose && LOOSE_WORD[w]) || CONTRACTIONS[w] || NUMS[w] || w;
    var parts = full.split(' ');
    if (loose) parts = parts.map(function (p) { return LOOSE_PART[p] || p; });
    return parts;
  }
  function tokenize(text, loose) {
    var toks = text.replace(/‿/g, ' ').split(/[\s\-–—]+/).filter(Boolean);
    var keys = [], owner = [];
    toks.forEach(function (t, i) { keysOf(t, loose).forEach(function (k) { keys.push(k); owner.push(i); }); });
    return { toks: toks, keys: keys, owner: owner };
  }
  function diffWords(target, said, loose) {
    var a = tokenize(target, loose), b = tokenize(said, loose);
    var n = a.keys.length, m = b.keys.length;
    var dp = [];
    for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) {
        dp[i][j] = a.keys[i] === b.keys[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var okA = {}, okB = {};
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a.keys[i] === b.keys[j]) { okA[i] = true; okB[j] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    function status(side, okMap) {
      var res = side.toks.map(function () { return { any: false, all: true }; });
      side.keys.forEach(function (k, idx) {
        var r = res[side.owner[idx]];
        r.any = true;
        if (!okMap[idx]) r.all = false;
      });
      return side.toks.map(function (t, idx) { return { w: t, ok: !res[idx].any || res[idx].all }; });
    }
    var target2 = status(a, okA), said2 = status(b, okB);
    var matched = Object.keys(okA).length;
    return {
      target: target2, said: said2, matched: matched, total: n,
      allOk: matched === n && Object.keys(okB).length === m
    };
  }
  function renderWords(list, badClass) {
    var p = h('span', { className: 'en' });
    list.forEach(function (x, i) {
      if (i) p.appendChild(document.createTextNode(' '));
      p.appendChild(h('span', { className: x.ok ? 'w-ok' : badClass, text: x.w }));
    });
    return p;
  }

  /* ================= 語音辨識 ================= */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var NO_SR = '這個瀏覽器不支援語音辨識，請改用電腦版 Chrome、Edge 或 Safari。';

  // opts: label, continuous, alts, onLive(text), onDone(text, alternatives, error)
  function listenButton(opts) {
    var b = btn(opts.label, null, 'btn-listen');
    if (!SR) { b.disabled = true; b.title = NO_SR; return b; }
    var rec = null;
    b.addEventListener('click', function () {
      if (rec) { rec.stop(); return; }
      stopSpeech();
      var finalText = '', interimText = '', alts = [], error = '';
      rec = new SR();
      rec.lang = 'en-US';
      rec.continuous = opts.continuous !== false;
      rec.interimResults = true;
      rec.maxAlternatives = opts.alts || 1;
      rec.onresult = function (e) {
        var fin = [], interim = [];
        alts = [];
        for (var i = 0; i < e.results.length; i++) {
          var r = e.results[i];
          if (r.isFinal) {
            fin.push(r[0].transcript.trim());
            for (var k = 0; k < r.length; k++) alts.push(r[k].transcript.trim());
          } else interim.push(r[0].transcript.trim());
        }
        finalText = fin.join(' ');
        interimText = interim.join(' ');
        if (opts.onLive) opts.onLive((finalText + ' ' + interimText).trim());
      };
      rec.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') error = '沒有麥克風權限。請在網址列旁邊允許使用麥克風，再試一次。';
        else if (e.error === 'no-speech') error = '沒有聽到聲音，靠近麥克風再試一次。';
        else if (e.error === 'network') error = '語音辨識需要連上網路。';
        else if (e.error !== 'aborted') error = '語音辨識發生問題（' + e.error + '），再試一次。';
      };
      rec.onend = function () {
        rec = null;
        b.textContent = opts.label;
        b.classList.remove('on');
        var text = (finalText || interimText).trim();
        if (!alts.length && text) alts = [text];
        opts.onDone(text, alts, error);
      };
      try {
        rec.start();
        b.textContent = '⏹ 說完了，按這裡';
        b.classList.add('on');
      } catch (err) {
        rec = null;
        opts.onDone('', [], '語音辨識無法啟動，請重新整理頁面再試。');
      }
    });
    return b;
  }

  /* ================= 錄音與錄音檔案夾 ================= */
  var DB_NAME = 'english-talk-recordings';
  function openDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
      var r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('recs', { keyPath: 'id', autoIncrement: true }); };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function dbDo(mode, fn) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('recs', mode);
        var req = fn(tx.objectStore('recs'));
        tx.oncomplete = function () { resolve(req && req.result); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  function saveRecording(obj) { return dbDo('readwrite', function (s) { return s.add(obj); }); }
  function allRecordings() { return dbDo('readonly', function (s) { return s.getAll(); }); }
  function deleteRecording(id) { return dbDo('readwrite', function (s) { return s.delete(id); }); }

  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    for (var i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    return '';
  }

  // opts: label（存檔名稱）, original（可選：function 回傳要先播放的原音句子陣列）
  function makeRecorder(opts) {
    var wrap = h('div', { className: 'recorder' });
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      wrap.appendChild(h('span', { className: 'small muted', text: '⚠️ 這個瀏覽器不能錄音，請改用 Chrome 或 Safari（需要用 https 網址開啟）。' }));
      return wrap;
    }
    var mr = null, stream = null, chunks = [], blob = null, url = '', startAt = 0, seconds = 0, tick = null, audio = null;
    var status = h('span', { className: 'rec-status' });
    var recBtn = btn('🎙️ 開始錄音', toggle, 'btn-primary');
    var playBtn = btn('▶ 聽我的錄音', function () { play(); });
    var cmpBtn = opts.original ? btn('🔁 先聽原音，再聽我的', compare) : null;
    var saveBtn = btn('💾 存進錄音檔案夾', store);
    playBtn.disabled = true; saveBtn.disabled = true;
    if (cmpBtn) cmpBtn.disabled = true;

    function toggle() {
      if (mr && mr.state === 'recording') { mr.stop(); return; }
      stopSpeech();
      if (audio) audio.pause();
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        chunks = [];
        var mime = pickMime();
        mr = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
        mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        mr.onstop = function () {
          clearInterval(tick);
          seconds = (Date.now() - startAt) / 1000;
          stream.getTracks().forEach(function (t) { t.stop(); });
          blob = new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' });
          if (url) URL.revokeObjectURL(url);
          url = URL.createObjectURL(blob);
          recBtn.textContent = '🎙️ 重新錄音';
          recBtn.classList.remove('on');
          playBtn.disabled = false; saveBtn.disabled = false;
          if (cmpBtn) cmpBtn.disabled = false;
          saveBtn.textContent = '💾 存進錄音檔案夾';
          status.textContent = '錄好了（' + mmss(seconds) + '）';
        };
        mr.start();
        startAt = Date.now();
        recBtn.textContent = '⏹ 停止錄音';
        recBtn.classList.add('on');
        status.innerHTML = '<span class="rec-dot"></span>錄音中 0:00';
        tick = setInterval(function () {
          status.innerHTML = '<span class="rec-dot"></span>錄音中 ' + mmss((Date.now() - startAt) / 1000);
        }, 500);
      }).catch(function () {
        status.textContent = '⚠️ 沒有麥克風權限。請在網址列旁邊允許使用麥克風，再試一次。';
      });
    }
    function play(done) {
      if (!url) return;
      stopSpeech();
      if (audio) audio.pause();
      audio = new Audio(url);
      audio.onended = function () { if (done) done(); };
      audio.play();
    }
    function compare() {
      status.textContent = '先播原音…';
      speakList(opts.original(), {
        onDone: function () {
          status.textContent = '換你的錄音…';
          setTimeout(function () { play(function () { status.textContent = '比一比：節奏和重音像不像？'; }); }, 500);
        }
      });
    }
    function store() {
      if (!blob) return;
      saveBtn.disabled = true;
      saveRecording({ label: opts.label || '錄音', date: new Date().toISOString(), blob: blob, type: blob.type, seconds: seconds })
        .then(function () {
          saveBtn.textContent = '✓ 已存好';
          status.innerHTML = '已存進 <a href="checkup.html#folder">錄音檔案夾</a>';
          document.dispatchEvent(new CustomEvent('en:recsaved'));
        })
        .catch(function () {
          saveBtn.disabled = false;
          status.textContent = '⚠️ 存檔失敗（可能是無痕模式），可以先用播放聽聽看。';
        });
    }
    [recBtn, playBtn, cmpBtn, saveBtn, status].forEach(function (x) { if (x) wrap.appendChild(x); });
    return wrap;
  }

  document.querySelectorAll('[data-recorder]').forEach(function (box) {
    box.appendChild(makeRecorder({ label: box.dataset.recorder || box.dataset.label }));
  });

  function renderFolder(box) {
    allRecordings().then(function (list) {
      box.innerHTML = '';
      list = (list || []).sort(function (a, b) { return b.date < a.date ? -1 : 1; });
      if (!list.length) {
        box.appendChild(h('p', { className: 'muted', text: '還沒有錄音。在任何練習按「💾 存進錄音檔案夾」，錄音就會出現在這裡。' }));
        return;
      }
      var months = {};
      list.forEach(function (r) {
        var m = r.date.slice(0, 7);
        (months[m] = months[m] || []).push(r);
      });
      Object.keys(months).forEach(function (m) {
        var group = h('div', { className: 'rec-month' }, [h('h4', { text: m.replace('-', ' 年 ') + ' 月（' + months[m].length + ' 個）' })]);
        months[m].forEach(function (r) {
          var src = URL.createObjectURL(r.blob);
          var d = new Date(r.date);
          var ext = /mp4/.test(r.type) ? 'm4a' : /ogg/.test(r.type) ? 'ogg' : 'webm';
          var name = r.date.slice(0, 10) + '-' + r.label.replace(/[\\/:*?"<>|\s]+/g, '_') + '.' + ext;
          group.appendChild(h('div', { className: 'rec-item' }, [
            h('div', { className: 'rec-head' }, [
              h('b', { text: r.label }),
              h('span', { className: 'small muted', text: d.toLocaleDateString('zh-TW') + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '．' + mmss(r.seconds || 0) })
            ]),
            h('audio', { controls: true, preload: 'metadata', src: src }),
            h('div', { className: 'tools' }, [
              h('a', { className: 'btn', href: src, download: name, text: '⬇️ 下載' }),
              btn('🗑 刪除', function () {
                if (!confirm('要刪除「' + r.label + '」這個錄音嗎？刪除後就找不回來了。')) return;
                deleteRecording(r.id).then(function () { renderFolder(box); });
              })
            ])
          ]));
        });
        box.appendChild(group);
      });
    }).catch(function () {
      box.innerHTML = '<p class="muted">⚠️ 這個瀏覽器不能保存錄音（可能是無痕模式）。</p>';
    });
  }
  document.querySelectorAll('[data-rec-list]').forEach(function (box) {
    renderFolder(box);
    document.addEventListener('en:recsaved', function () { renderFolder(box); });
  });

  /* ================= [data-listen]：看看我說了什麼 ================= */
  document.querySelectorAll('[data-listen]').forEach(function (box) {
    var live = h('div', { className: 'live-text en', 'aria-live': 'polite' });
    var stats = h('p', { className: 'small muted' });
    var t0 = 0;
    live.textContent = SR ? '按下按鈕開始說，說完再按一次。電腦聽到的字會出現在這裡。' : NO_SR;
    var b = listenButton({
      label: '🗒️ 看看我說了什麼',
      onLive: function (text) {
        if (!t0) t0 = Date.now();
        live.textContent = text;
      },
      onDone: function (text, alts, err) {
        var sec = t0 ? (Date.now() - t0) / 1000 : 0;
        t0 = 0;
        if (!text) { live.textContent = err || '沒有聽到內容，再試一次。'; stats.textContent = ''; return; }
        live.textContent = text;
        var words = text.split(/\s+/).filter(Boolean).length;
        var wpm = sec > 5 ? Math.round(words / (sec / 60)) : 0;
        stats.textContent = '共 ' + words + ' 個字' + (wpm ? '，大約每分鐘 ' + wpm + ' 個字' : '') +
          '。（電腦聽不懂的字不一定是你說錯，也可能是收音不清楚。）';
      }
    });
    b.addEventListener('click', function () { if (b.classList.contains('on')) t0 = 0; });
    box.appendChild(h('div', { className: 'tools' }, [b]));
    box.appendChild(live);
    box.appendChild(stats);
  });

  /* ================= 跟讀 ================= */
  var STEPS = ['① 只聽不看', '② 看文字聽', '③ 看文字跟著唸', '④ 不看文字跟著唸', '⑤ 錄音和原音比'];

  document.querySelectorAll('.shadow').forEach(function (box) {
    var id = box.dataset.id;
    var title = (box.querySelector('h3') || {}).textContent || id;
    var textBox = box.querySelector('.shadow-text');
    var sents = [].slice.call(textBox.querySelectorAll('.s'));
    function plain(s) { return s.textContent.replace(/‿/g, ' ').replace(/\s+/g, ' ').trim(); }
    function texts() { return sents.map(plain); }
    function mark(k) { sents.forEach(function (s, i) { s.classList.toggle('playing', i === k); }); }

    var modeSel = h('select', { 'aria-label': '播放方式' }, [
      h('option', { value: 'flow', text: '連續播放' }),
      h('option', { value: 'pause', text: '每句停一下，讓我跟著唸' })
    ]);
    function playFrom(start, single) {
      var list = single ? [texts()[start]] : texts().slice(start);
      speakList(list, {
        onEach: function (i) { mark(start + i); },
        gap: function (i, ms) { return modeSel.value === 'pause' ? Math.max(1500, ms * 1.4) : 250; },
        onDone: function () { mark(-1); }
      });
    }
    sents.forEach(function (s, i) {
      s.tabIndex = 0;
      s.setAttribute('role', 'button');
      s.title = '點一下，聽這一句';
      s.addEventListener('click', function () { playFrom(i, true); });
      s.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playFrom(i, true); }
      });
    });

    function toggle(label, cls, startOn) {
      var b = btn(label, function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on);
        box.classList.toggle(cls, !on);
      });
      b.setAttribute('aria-pressed', startOn);
      box.classList.toggle(cls, !startOn);
      return b;
    }

    var tools1 = h('div', { className: 'tools' }, [
      btn('▶ 播放全文', function () { playFrom(0, false); }, 'btn-primary'),
      btn('⏹ 停止', function () { stopSpeech(); mark(-1); }),
      modeSel
    ]);
    var tools2 = h('div', { className: 'tools' }, [
      h('span', { className: 'small muted', text: '顯示：' }),
      toggle('文字', 'hide-text', true),
      toggle('重音', 'no-stress', true),
      toggle('連音', 'no-link', true)
    ]);
    textBox.parentNode.insertBefore(tools1, textBox);
    textBox.parentNode.insertBefore(tools2, textBox);

    // 錄音＋語音辨識檢查
    var result = h('div', { className: 'check-result', 'aria-live': 'polite' });
    var checkBtn = listenButton({
      label: '✅ 用語音辨識檢查',
      onLive: function (t) { result.innerHTML = ''; result.appendChild(h('p', { className: 'small muted en', text: '聽到：' + t })); },
      onDone: function (said, alts, err) {
        result.innerHTML = '';
        if (!said) { result.appendChild(h('p', { className: 'small muted', text: err || '沒有聽到內容，再試一次。' })); return; }
        var d = diffWords(texts().join(' '), said, true);
        var pct = Math.round(d.matched / d.total * 100);
        result.appendChild(h('p', { className: 'small' }, [
          h('b', { text: '電腦聽懂了 ' + pct + '% 的字。' }),
          ' 紅色的字是電腦沒聽到的，回去聽聽原音，特別注意這些字。'
        ]));
        result.appendChild(h('div', { className: 'diff' }, [renderWords(d.target, 'w-miss')]));
      }
    });
    var practice = h('div', { className: 'shadow-practice' }, [
      h('p', { className: 'small muted', text: '錄下自己唸的，再和原音比較；或用語音辨識看看電腦聽不聽得懂。' }),
      makeRecorder({ label: '跟讀：' + title, original: texts }),
      h('div', { className: 'tools' }, [checkBtn]),
      result
    ]);
    box.appendChild(practice);

    // 步驟打勾
    var rec = state.shadow[id] || { days: 0, last: '', steps: [] };
    var isToday = rec.last === today();
    var daysLabel = h('span', { className: 'days' });
    function showDays() {
      daysLabel.textContent = rec.days ? '已經練了 ' + rec.days + ' 天' + (rec.days >= 7 ? ' 🎉 可以換下一篇了' : '（建議一篇練一週）') : '還沒開始';
    }
    var stepsBox = h('div', { className: 'steps-check' }, [h('b', { text: '今天完成：' })]);
    STEPS.forEach(function (label, i) {
      var cb = h('input', { type: 'checkbox' });
      cb.checked = isToday && rec.steps.indexOf(i) !== -1;
      cb.addEventListener('change', function () {
        if (rec.last !== today()) { rec.last = today(); rec.days++; rec.steps = []; }
        if (cb.checked) { if (rec.steps.indexOf(i) === -1) rec.steps.push(i); }
        else rec.steps = rec.steps.filter(function (x) { return x !== i; });
        state.shadow[id] = rec;
        save();
        showDays();
      });
      stepsBox.appendChild(h('label', {}, [cb, label]));
    });
    showDays();
    stepsBox.appendChild(daysLabel);
    box.appendChild(stepsBox);
  });

  /* ================= 聽寫 ================= */
  var dicts = [].slice.call(document.querySelectorAll('.dict'));
  if (dicts.length && page) { state.dictTotals[page] = dicts.length; save(); }

  function updateDictScore() {
    var right = 0, done = 0;
    dicts.forEach(function (d) {
      var r = state.dict[d.dataset.id];
      if (r && r.tries) done++;
      if (r && r.correct) right++;
    });
    document.querySelectorAll('.dict-score').forEach(function (s) {
      s.querySelector('.label').textContent = '聽寫：已作答 ' + done + ' / ' + dicts.length + ' 句，全對 ' + right + ' 句';
      s.querySelector('.bar i').style.width = (dicts.length ? right / dicts.length * 100 : 0) + '%';
    });
    return { right: right, total: dicts.length };
  }

  dicts.forEach(function (box) {
    var id = box.dataset.id;
    var text = box.dataset.text;
    var explain = box.querySelector('.explain');
    if (explain) explain.hidden = true;
    var input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': '把聽到的句子打出來', placeholder: '把聽到的句子打出來…' });
    var out = h('div', { className: 'dict-out', 'aria-live': 'polite' });

    function show(typed, reveal) {
      out.innerHTML = '';
      if (reveal) {
        out.appendChild(h('div', { className: 'diff' }, [h('span', { className: 'small muted', text: '正確句子：' }), h('span', { className: 'en', text: text })]));
      } else {
        var d = diffWords(text, typed, false);
        if (d.allOk) {
          out.appendChild(h('p', { className: 'feedback ok', text: '🎉 全對！' }));
        } else {
          out.appendChild(h('p', { className: 'feedback no', text: '聽出 ' + d.matched + ' / ' + d.total + ' 個字。紅色是漏掉或寫錯的字，再聽一次試試看。' }));
          var gaps = d.target.map(function (x) { return { w: x.ok ? x.w : '____', ok: x.ok }; });
          out.appendChild(h('div', { className: 'diff' }, [
            h('span', { className: 'small muted', text: '你寫的：' }), renderWords(d.said, 'w-extra'), h('br'),
            h('span', { className: 'small muted', text: '要補的地方：' }), renderWords(gaps, 'w-miss')
          ]));
        }
      }
      // 解析會洩漏答案：全對或按「看答案」才顯示
      if (explain) explain.hidden = !(reveal || diffWords(text, typed, false).allOk);
      box.classList.toggle('done', !!(state.dict[id] && state.dict[id].correct));
    }
    function check() {
      if (!input.value.trim()) { input.focus(); return; }
      var r = state.dict[id] || { tries: 0, correct: false };
      r.tries++;
      r.last = input.value;
      if (diffWords(text, input.value, false).allOk) r.correct = true;
      state.dict[id] = r;
      save();
      show(input.value, false);
      updateDictScore();
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    var row = h('div', { className: 'dict-row' }, [
      h('span', { className: 'dict-num' }),
      btn('🔊 播放', function () { speak(text); }),
      btn('🐢 慢速', function () { speak(text, { rate: 0.6 }); }),
      input,
      btn('檢查', check, 'btn-primary'),
      btn('看答案', function () {
        var r = state.dict[id] || { tries: 0, correct: false };
        if (!r.tries) { r.tries = 1; state.dict[id] = r; save(); updateDictScore(); }
        show('', true);
      })
    ]);
    box.insertBefore(row, box.firstChild);
    box.insertBefore(out, explain || null);

    var saved = state.dict[id];
    if (saved && saved.last) { input.value = saved.last; show(saved.last, false); }
  });
  if (dicts.length) updateDictScore();

  /* ================= 辨音遊戲 ================= */
  document.querySelectorAll('.pair-quiz').forEach(function (box) {
    var id = box.dataset.id;
    var pairs = box.dataset.pairs.split(',').map(function (p) { return p.trim().split('|'); });
    var sc = state.pairs[id] || { right: 0, total: 0 };
    var current = null;

    var list = h('div', { className: 'pq-list' });
    pairs.forEach(function (p) {
      list.appendChild(h('span', { className: 'pq-pair' }, [
        h('button', { type: 'button', className: 'say en', 'data-say': p[0], text: p[0] }),
        h('span', { className: 'muted', text: '／' }),
        h('button', { type: 'button', className: 'say en', 'data-say': p[1], text: p[1] })
      ]));
    });

    var scoreLabel = h('span', { className: 'pq-score' });
    function showScore() { scoreLabel.textContent = sc.total ? '答對 ' + sc.right + ' / ' + sc.total : ''; }
    var feedback = h('p', { className: 'feedback', 'aria-live': 'polite' });
    var choices = h('div', { className: 'pq-choices' });

    function ask() {
      var p = pairs[Math.floor(Math.random() * pairs.length)];
      var k = Math.random() < 0.5 ? 0 : 1;
      current = { pair: p, word: p[k], answered: false };
      choices.innerHTML = '';
      feedback.textContent = '聽到的是哪一個？';
      feedback.className = 'feedback';
      p.forEach(function (w) {
        var b = btn(w, function () {
          if (current.answered) return;
          current.answered = true;
          var ok = w === current.word;
          sc.total++;
          if (ok) sc.right++;
          state.pairs[id] = sc;
          save();
          showScore();
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) [].forEach.call(choices.children, function (c) { if (c.textContent === current.word) c.classList.add('right'); });
          feedback.textContent = ok ? '🎉 答對了！' : '是 ' + current.word + '。兩個字都聽聽看，比較差在哪裡。';
          feedback.className = 'feedback ' + (ok ? 'ok' : 'no');
        }, 'en');
        choices.appendChild(b);
      });
      speak(current.word);
    }

    // 換我說
    var sayTarget = h('span', { className: 'en pq-target' });
    var sayResult = h('span', { className: 'small', 'aria-live': 'polite' });
    var sayWord = '';
    function newSayWord() {
      var p = pairs[Math.floor(Math.random() * pairs.length)];
      sayWord = p[Math.random() < 0.5 ? 0 : 1];
      sayTarget.textContent = sayWord;
      sayResult.textContent = '';
    }
    var sayBtn = listenButton({
      label: '🎙️ 說說看',
      continuous: false,
      alts: 5,
      onDone: function (text, alts, err) {
        if (!text) { sayResult.textContent = err || '沒有聽到，再試一次。'; return; }
        var hit = alts.some(function (a) { return keysOf(a.split(/\s+/).pop(), false).join(' ') === sayWord.toLowerCase(); });
        sayResult.textContent = hit ? '✅ 電腦聽到 ' + sayWord + '，說得很清楚！' : '電腦聽成「' + text + '」。聽一次示範，注意嘴巴的動作，再試一次。';
        sayResult.className = 'small ' + (hit ? 'ok-text' : 'no-text');
      }
    });
    newSayWord();

    box.appendChild(list);
    box.appendChild(h('div', { className: 'pq-game' }, [
      h('div', { className: 'tools' }, [
        btn('▶ 出一題', ask, 'btn-primary'),
        btn('🔁 再聽一次', function () { if (current) speak(current.word); }),
        scoreLabel,
        btn('歸零', function () { sc = { right: 0, total: 0 }; state.pairs[id] = sc; save(); showScore(); }, 'small-btn')
      ]),
      feedback,
      choices
    ]));
    box.appendChild(h('div', { className: 'pq-say' }, [
      h('span', { className: 'small muted', text: '換你說：' }),
      sayTarget,
      h('button', { type: 'button', className: 'say', 'data-say': '', text: '🔊', onclick: function (e) { e.stopPropagation(); speak(sayWord); } }),
      sayBtn,
      btn('換一個字', newSayWord),
      sayResult
    ]));
    feedback.textContent = '按「出一題」，電腦會唸其中一個字。';
    showScore();
  });

  /* ================= 4-3-2 計時 ================= */
  var audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25].forEach(function (t) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.15, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.2);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.22);
      });
    } catch (e) {}
  }
  document.querySelectorAll('.timer432').forEach(function (box) {
    var seq = (box.dataset.seq || '240,180,120').split(',').map(Number);
    var round = 0, left = seq[0], timer = null;
    var pills = h('div', { className: 'timer-rounds' });
    seq.forEach(function (s, i) { pills.appendChild(h('span', { text: '第 ' + (i + 1) + ' 輪 ' + mmss(s) })); });
    var display = h('div', { className: 'timer-display', role: 'timer', 'aria-live': 'off' });
    var note = h('p', { className: 'small muted', 'aria-live': 'polite' });
    var startBtn = btn('▶ 開始', startPause, 'btn-primary');
    function render() {
      display.textContent = mmss(left);
      [].forEach.call(pills.children, function (p, i) { p.classList.toggle('on', i === round); });
      box.classList.toggle('ending', left <= 10 && left > 0 && !!timer);
    }
    function startPause() {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (timer) { clearInterval(timer); timer = null; startBtn.textContent = '▶ 繼續'; render(); return; }
      if (left <= 0) return;
      startBtn.textContent = '⏸ 暫停';
      note.textContent = '第 ' + (round + 1) + ' 輪：把同樣的內容說完，時間到之前不要停。';
      timer = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(timer); timer = null;
          beep();
          startBtn.textContent = '▶ 開始';
          note.textContent = round < seq.length - 1 ? '⏰ 時間到！喘口氣，按「下一輪」用更短的時間再說一次。' : '🎉 三輪都完成了！最後一輪是不是說得最順？';
        }
        render();
      }, 1000);
      render();
    }
    function go(r) {
      clearInterval(timer); timer = null;
      round = r; left = seq[r];
      startBtn.textContent = '▶ 開始';
      note.textContent = '';
      render();
    }
    box.appendChild(pills);
    box.appendChild(display);
    box.appendChild(h('div', { className: 'tools center' }, [
      startBtn,
      btn('⏭ 下一輪', function () { go(Math.min(round + 1, seq.length - 1)); }),
      btn('↺ 從頭', function () { go(0); })
    ]));
    box.appendChild(note);
    render();
  });

  /* ================= 複製文字 ================= */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      var src = document.querySelector(b.dataset.copy);
      var text = src ? src.textContent.trim() : '';
      var old = b.textContent;
      function done(ok) { b.textContent = ok ? '✓ 已複製' : '請手動選取複製'; setTimeout(function () { b.textContent = old; }, 1800); }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  });

  /* ================= 每月聽寫紀錄 ================= */
  function renderHistory() {
    document.querySelectorAll('[data-checkup-history]').forEach(function (box) {
      box.innerHTML = '';
      if (!state.checkups.length) { box.appendChild(h('p', { className: 'small muted', text: '還沒有紀錄。' })); return; }
      var tbody = h('tbody');
      state.checkups.slice().reverse().forEach(function (c) {
        tbody.appendChild(h('tr', {}, [h('td', { text: c.date }), h('td', { text: c.right + ' / ' + c.total + ' 句全對' }), h('td', { text: c.note || '' })]));
      });
      box.appendChild(h('div', { className: 'table-wrap' }, [h('table', {}, [
        h('thead', {}, [h('tr', {}, [h('th', { text: '日期' }), h('th', { text: '聽寫' }), h('th', { text: '備註' })])]),
        tbody
      ])]));
    });
  }
  document.querySelectorAll('[data-checkup-save]').forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      var s = updateDictScore();
      var note = prompt('要不要加一句備註？（例如：連音比上個月清楚）', '') || '';
      state.checkups.push({ date: today(), right: s.right, total: s.total, note: note.slice(0, 80) });
      save();
      renderHistory();
    });
  });
  document.querySelectorAll('[data-action="dict-clear"]').forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      if (!confirm('要清掉這一頁的聽寫答案，重新做一次嗎？（已存的每月紀錄和錄音不會被刪掉）')) return;
      dicts.forEach(function (d) { delete state.dict[d.dataset.id]; });
      save();
      location.reload();
    });
  });
  renderHistory();

  /* ================= 筆記（沒有載入 quiz.js 的頁面用） ================= */
  state.notes = state.notes || {};
  document.querySelectorAll('textarea[data-note-local]').forEach(function (t) {
    var nid = t.dataset.noteLocal;
    if (state.notes[nid]) t.value = state.notes[nid];
    var timer;
    t.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (t.value.trim()) state.notes[nid] = t.value; else delete state.notes[nid];
        save();
      }, 400);
    });
  });

  /* ================= 清除本頁紀錄 ================= */
  document.querySelectorAll('[data-action="en-reset"]').forEach(function (b) {
    b.type = 'button';
    b.addEventListener('click', function () {
      if (!confirm('要清除這一頁的練習紀錄嗎？（錄音檔案夾裡的錄音不會被刪掉）')) return;
      document.querySelectorAll('.shadow').forEach(function (s) { delete state.shadow[s.dataset.id]; });
      dicts.forEach(function (d) { delete state.dict[d.dataset.id]; });
      document.querySelectorAll('.pair-quiz').forEach(function (p) { delete state.pairs[p.dataset.id]; });
      save();
      try {
        var q = JSON.parse(localStorage.getItem(QUIZ_KEY));
        if (q && q.pages && page) { delete q.pages[page]; localStorage.setItem(QUIZ_KEY, JSON.stringify(q)); }
      } catch (e) {}
      location.reload();
    });
  });

  window.addEventListener('pagehide', stopSpeech);
})();
