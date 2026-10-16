const UI = (() => {

  let screens = {};
  let current = 'menu';

  function init() {
    screens = {
      menu: document.getElementById('screen-menu'),
      game: document.getElementById('screen-game'),
      lobby: document.getElementById('screen-lobby'),
      leaderboard: document.getElementById('screen-leaderboard'),
      result: document.getElementById('screen-result')
    };

    document.body.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav]');
      if (btn) {
        e.preventDefault();
        show(btn.dataset.nav);
      }
    });
  }

  function show(name) {
    if (!screens[name]) return;

    for (var key in screens) {
      screens[key].classList.toggle('is-active', key === name);
    }

    document.body.dataset.screen = name;
    current = name;
    window.scrollTo(0, 0);
  }

  function currentScreen() { return current; }

  function setGameModeTag(text) {
    var el = document.getElementById('gameModeTag');
    if (el) el.textContent = text;
  }

  function setStat(name, value) {
    var el = document.getElementById(name);
    if (el) el.textContent = value;
  }

  function setProgress(ratio) {
    var fill = document.getElementById('progressFill');
    if (fill) fill.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
  }

  function setProgressText(pos, total) {
    var el = document.getElementById('progressText');
    if (el) el.textContent = pos + ' / ' + total;
  }

  function pulseStat(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var box = el.closest('.stat');
    if (!box) return;
    box.classList.add('is-hot');
    setTimeout(function () { box.classList.remove('is-hot'); }, 500);
  }

  function urgentTimer() {
    var el = document.getElementById('liveTime');
    if (!el) return;
    var box = el.closest('.stat');
    if (box) box.classList.add('is-urgent');
  }

  function clearUrgent() {
    document.querySelectorAll('.stat.is-urgent').forEach(function (el) {
      el.classList.remove('is-urgent');
    });
  }

  function overlay(title, msg, dead) {
    var el = document.getElementById('gameOverlay');
    if (!el) return;
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMsg').textContent = msg;
    el.classList.toggle('is-dead', !!dead);
    el.hidden = false;
  }

  function hideOverlay() {
    var el = document.getElementById('gameOverlay');
    if (el) el.hidden = true;
  }

  function toast(msg, kind) {
    var stack = document.getElementById('toastStack');
    if (!stack) return;

    var t = document.createElement('div');
    t.className = 'toast' + (kind ? ' is-' + kind : '');
    t.textContent = msg;
    stack.appendChild(t);

    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'opacity .2s, transform .2s';
      setTimeout(function () { t.remove(); }, 220);
    }, (window.CFG && CFG.toastMs) || 3000);
  }

  function showResult(data) {
    document.getElementById('resultMode').textContent = data.modeLabel || '';
    document.getElementById('resultRank').textContent = data.rank || '';
    document.getElementById('resultWpm').textContent = data.wpm;
    document.getElementById('resultAcc').textContent = data.acc;
    document.getElementById('resultErrors').textContent = data.errors;
    document.getElementById('resultConsist').textContent = data.consistency || 0;

    var pb = document.getElementById('resultPB');
    if (pb) pb.hidden = !data.newPB;

    if (data.samples && window.drawWpmGraph) {
      window.drawWpmGraph(data.samples);
    }

    show('result');
  }

  function focusTypingArea() {
    var input = document.getElementById('hiddenInput');
    if (input) input.focus();
  }

  function tickSoundIcon(on) {
    var btn = document.getElementById('soundToggle');
    if (btn) btn.textContent = on ? '🔊' : '🔇';
  }

  function setTheme(name) {
  document.body.classList.remove(
    'theme-dollshop',
    'theme-abbaye'
  );
  document.body.classList.add('theme-' + name);
}

  function setLobbyVisible(visible) {
    var p = document.getElementById('roomPanel');
    if (p) p.hidden = !visible;
  }

  function setRoomCode(code) {
    var el = document.getElementById('roomCodeLabel');
    if (el) el.textContent = code || '----';
  }

  function renderPlayers(list) {
    var ul = document.getElementById('playerList');
    if (!ul) return;
    ul.innerHTML = '';
    list.forEach(function (p) {
      var li = document.createElement('li');
      li.textContent = p.name;
      if (p.host) li.classList.add('is-host');
      ul.appendChild(li);
    });
  }

  function enableStart(on, label) {
    var btn = document.getElementById('startRaceBtn');
    if (!btn) return;
    btn.disabled = !on;
    if (label) btn.textContent = label;
  }

  function boardRows(rows) {
    var body = document.getElementById('boardBody');
    var empty = document.getElementById('boardEmpty');
    if (!body) return;

    body.innerHTML = '';

    if (!rows || !rows.length) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    rows.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (i + 1) + '</td>' +
        '<td>' + escapeHtml(r.name) + '</td>' +
        '<td>' + r.wpm + '</td>' +
        '<td>' + r.acc + '%</td>' +
        '<td>' + escapeHtml(r.mode) + '</td>';
      body.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  return {
    init: init,
    show: show,
    currentScreen: currentScreen,
    setGameModeTag: setGameModeTag,
    setStat: setStat,
    setProgress: setProgress,
    setProgressText: setProgressText,
    pulseStat: pulseStat,
    urgentTimer: urgentTimer,
    clearUrgent: clearUrgent,
    overlay: overlay,
    hideOverlay: hideOverlay,
    toast: toast,
    showResult: showResult,
    focusTypingArea: focusTypingArea,
    tickSoundIcon: tickSoundIcon,
    setTheme: setTheme,
    setLobbyVisible: setLobbyVisible,
    setRoomCode: setRoomCode,
    renderPlayers: renderPlayers,
    enableStart: enableStart,
    boardRows: boardRows
  };

})();

window.UI = UI;
