const App = (function () {

  var cur = {
    mode: 'timed',
    duration: 30,
    label: 'Timed · 30s',
    room: null,
    me: null,
    samples: []
  };

  var statTimer = null;
  var lastWpm = 0;
  var lastResult = 0;

  function boot() {
    UI.init();
    if (window.FB) FB.init();
    if (window.Store) Store.load();
    if (window.Sound) Sound.load();
    if (window.Lobby) Lobby.init();

    prefs();
    paint();
    menuClicks();
    gameClicks();
    resultClicks();
    boardInit();

    document.body.classList.add('theme-ready');

    var stage = document.querySelector('.game-stage');
    if (stage) {
      stage.addEventListener('click', function () {
        Typing.focus();
      });
    }
  }

  function prefs() {
    if (!window.Store) return;
    var t = Store.get('theme') || 'neon';
    UI.setTheme(t);

    if (Store.get('sound') === false && window.Sound) Sound.toggle();
    UI.tickSoundIcon(window.Sound ? Sound.isOn() : true);
  }

  function paint() {
    if (!window.Store) return;
    var s = Store.get();
    set('pbWpm', s.pbWpm || '—');
    set('pbAcc', s.pbAcc || '—');
    set('pbCount', s.pbCount || 0);
    set('pbStreak', s.streak || 0);
    if (window.paintChip) {
      paintChip(document.getElementById('rankChip'), s.pbWpm || 0);
    }
  }

  function set(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function menuClicks() {
    var cards = document.querySelectorAll('.mode-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', onCardClick);
    }
  }

  function onCardClick(e) {
    var mode = e.currentTarget.dataset.mode;
    if (mode === 'custom') {
      var t = prompt('Paste the text you want to type:');
      if (!t || !t.trim()) return;
      startSingle(mode, { text: t.trim() });
      return;
    }
    if (mode === 'code') {
      var lang = prompt('Language: js, html, or py', 'js');
      startSingle(mode, { lang: (lang || 'js').toLowerCase() });
      return;
    }
    startSingle(mode);
  }

  function startSingle(mode, opts) {
    opts = opts || {};
    var dur = 30;

    if (mode === 'timed') {
      var d = prompt('Duration: 15, 30, or 60 seconds', '30');
      dur = parseInt(d, 10);
      if (dur !== 15 && dur !== 30 && dur !== 60) dur = 30;
    }

    var label = makeLabel(mode, dur);
    cur = { mode: mode, duration: dur, label: label, room: null, me: null, samples: [] };

    UI.setGameModeTag(label);
    UI.hideOverlay();
    UI.clearUrgent();
    UI.show('game');

    wire();
    Modes.start(mode, { duration: dur, lang: opts.lang, text: opts.text });
  }

  function makeLabel(mode, dur) {
    if (mode === 'timed') return 'Timed · ' + dur + 's';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  function wire() {
    Modes.handlers({
      onTick: tick,
      onUrgent: urgent,
      onFirstKey: firstKey,
      onCharCorrect: good,
      onCharWrong: bad,
      onCharUndo: undo,
      onProgress: progress,
      onComplete: complete,
      onFinish: finish
    });
  }

  function tick(secs) {
    if (secs !== null && secs !== undefined) set('liveTime', secs);
  }

  function urgent() {
    UI.urgentTimer();
  }

  function firstKey() {
    loop();
  }

  function good() {
    if (window.Sound) Sound.play('key');
  }

  function bad() {
    if (window.Sound) Sound.play('wrong');
  }

  function undo() {
    // tiles handled by reveal.js
  }

  function progress(s) {
    push(s);
  }

  function loop() {
    if (statTimer) return;
    statTimer = setInterval(function () {
      if (!window.Typing) return;
      var s = Typing.snapshot();
      push(s);

      if (s.wpm > lastWpm) {
        UI.pulseStat('liveWpm');
        lastWpm = s.wpm;
      }

      if (s.elapsed > 0 && cur.samples.length < 200) {
        var last = cur.samples[cur.samples.length - 1];
        if (!last || s.elapsed - last.t > 0.5) {
          cur.samples.push({ t: s.elapsed, wpm: s.wpm, acc: s.acc });
        }
      }

      if (window.Lobby && cur.room) {
        Lobby.pushProgress(s, false);
      }
    }, 200);
  }

  function stopLoop() {
    if (statTimer) {
      clearInterval(statTimer);
      statTimer = null;
    }
  }

  function push(s) {
    set('liveWpm', s.wpm);
    set('liveAcc', s.acc);
    set('liveErrors', s.errors);
    UI.setProgress(s.progress);
    UI.setProgressText(s.pos, s.total);
  }

  function complete(s) {
    if (window.Lobby && cur.room) Lobby.pushProgress(s, true);
  }

  function finish(reason, s) {
    stopLoop();

    if (reason === 'dead') {
      UI.overlay('You died', 'One mistake was all it took.', true);
      if (window.Sound) Sound.play('wrong');
      return;
    }

    if (window.Sound) Sound.play('finish');

    var pb = { newWpm: false };
    if (window.Store) {
      pb = Store.recordRun({ wpm: s.wpm, acc: s.acc, mode: cur.mode });
    }

    if (window.FB && FB.isReady() && s.wpm > 0) {
      var name = (window.Store && Store.get('lastName')) || 'guest';
      FB.submitScore({ name: name, wpm: s.wpm, acc: s.acc, mode: cur.mode });
    }

    result(s, pb);
  }

  function result(s, pb) {
    var list = cur.samples.map(function (x) { return x.wpm; });
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += list[i];
    var mean = list.length ? sum / list.length : 0;

    var vsum = 0;
    for (var j = 0; j < list.length; j++) vsum += (list[j] - mean) * (list[j] - mean);
    var variance = list.length ? vsum / list.length : 0;
    var sd = Math.sqrt(variance);
    var consistency = mean > 0 ? Math.max(0, Math.round(100 - (sd / mean) * 100)) : 0;

    var rank = window.rankFor ? rankFor(s.wpm) : { name: '—' };
    lastResult = s.wpm;

    UI.showResult({
      modeLabel: cur.label,
      rank: rank.name,
      wpm: s.wpm,
      acc: s.acc,
      errors: s.errors,
      consistency: consistency,
      newPB: pb.newWpm,
      samples: cur.samples
    });

    paint();
  }

  function gameClicks() {
    var r = document.getElementById('restartBtn');
    if (r) r.addEventListener('click', function () {
      UI.hideOverlay();
      startSingle(cur.mode, { duration: cur.duration });
    });

    var a = document.getElementById('againBtn');
    if (a) a.addEventListener('click', function () {
      UI.hideOverlay();
      startSingle(cur.mode, { duration: cur.duration });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && document.body.dataset.screen === 'game') e.preventDefault();
      if (e.key === 'Enter' && e.ctrlKey && document.body.dataset.screen === 'game') {
        startSingle(cur.mode, { duration: cur.duration });
      }
    });
  }

  function resultClicks() {
    var a = document.getElementById('resultAgainBtn');
    if (a) a.addEventListener('click', function () {
      startSingle(cur.mode, { duration: cur.duration });
    });

    var s = document.getElementById('shareBtn');
    if (s) s.addEventListener('click', function () {
      var text = 'I just hit ' + lastResult + ' wpm on TypeArena';
      if (navigator.share) {
        navigator.share({ text: text }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          UI.toast('Copied to clipboard', 'ok');
        });
      }
    });
  }

  function boardInit() {
    if (!window.FB || !FB.isReady()) {
      var e = document.getElementById('boardEmpty');
      if (e) e.hidden = false;
      return;
    }

    var tabs = document.querySelectorAll('#boardTabs .tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        loadBoard(tab.dataset.range);
      });
    });

    loadBoard('all');
  }

  function loadBoard(range) {
    if (!window.FB || !FB.isReady()) return;
    FB.fetchBoard(range, 50).then(function (rows) {
      UI.boardRows(rows);
    });
  }

  function beginRace(opts) {
    cur = {
      mode: opts.mode || 'timed',
      duration: opts.duration || 30,
      label: makeLabel(opts.mode || 'timed', opts.duration || 30),
      room: opts.room,
      me: opts.me,
      samples: []
    };

    UI.setGameModeTag(cur.label + ' · Race');
    UI.hideOverlay();
    UI.clearUrgent();
    UI.show('game');

    wire();
    Modes.start(cur.mode, { duration: cur.duration });
  }

  window.addEventListener('DOMContentLoaded', boot);
  window.App = { beginRace: beginRace };

    function drawWpmGraph(samples) {
    var canvas = document.getElementById('wpmGraph');
    if (!canvas || !samples || !samples.length) return;

    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var pad = { top: 10, right: 12, bottom: 22, left: 32 };

    ctx.clearRect(0, 0, w, h);

    var maxWpm = 0;
    for (var i = 0; i < samples.length; i++) {
      if (samples[i].wpm > maxWpm) maxWpm = samples[i].wpm;
    }
    maxWpm = Math.max(40, Math.ceil(maxWpm / 10) * 10);

    var innerW = w - pad.left - pad.right;
    var innerH = h - pad.top - pad.bottom;

    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (var g = 1; g <= 3; g++) {
      var gy = pad.top + (innerH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();
    }

    // y axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(maxWpm), pad.left - 6, pad.top + 10);
    ctx.fillText('0', pad.left - 6, pad.top + innerH);

    // x axis: total time
    var totalT = samples[samples.length - 1].t || 1;
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(totalT) + 's', w - pad.right - 10, h - 6);

    // build the line path
    var pts = [];
    for (var j = 0; j < samples.length; j++) {
      var s = samples[j];
      var x = pad.left + (s.t / totalT) * innerW;
      var y = pad.top + innerH - (s.wpm / maxWpm) * innerH;
      pts.push({ x: x, y: y });
    }

    // fill under the line
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + innerH);
    grad.addColorStop(0, 'rgba(76,201,240,0.35)');
    grad.addColorStop(1, 'rgba(76,201,240,0)');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + innerH);
    for (var k = 0; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
    ctx.lineTo(pts[pts.length - 1].x, pad.top + innerH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // the line itself
    ctx.beginPath();
    for (var m = 0; m < pts.length; m++) {
      if (m === 0) ctx.moveTo(pts[m].x, pts[m].y);
      else ctx.lineTo(pts[m].x, pts[m].y);
    }
    ctx.strokeStyle = '#4cc9f0';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // end dot
    var last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#f72585';
    ctx.fill();
  }

  window.drawWpmGraph = drawWpmGraph;

})();