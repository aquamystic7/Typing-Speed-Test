const UI = (() => {

  let screens = {};
  let current = 'menu';
  let toastTimer = null;

  function init() {
    screens = {
      menu: document.getElementById('screen-menu'),
      game: document.getElementById('screen-game'),
      lobby: document.getElementById('screen-lobby'),
      leaderboard: document.getElementById('screen-leaderboard'),
      result: document.getElementById('screen-result'),
    };

    document.body.addEventListener('click', e => {
      const btn = e.target.closest('[data-nav]');
      if (btn) {
        e.preventDefault();
        show(btn.dataset.nav);
      }
    });
  }

  function show(name) {
    if (!screens[name]) return;

    for (const key in screens) {
      screens[key].classList.toggle('is-active', key === name);
    }

    document.body.dataset.screen = name;
    current = name;
    window.scrollTo(0, 0);
  }

  function currentScreen() {
    return current;
  }

  function setGameModeTag(text) {
    const el = document.getElementById('gameModeTag');
    if (el) el.textContent = text;
  }

  function setStat(name, value) {
    const el = document.getElementById(name);
    if (!el) return;
    el.textContent = value;
  }

  function setProgress(ratio) {
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
  }

  function setProgressText(pos, total) {
    const el = document.getElementById('progressText');
    if (el) el.textContent = pos + ' / ' + total;
  }

  function pulseStat(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const box = el.closest('.stat');
    if (!box) return;
    box.classList.add('is-hot');
    setTimeout(() => box.classList.remove('is-hot'), 500);
  }

  function urgentTimer() {
    const box = document.getElementById('liveTime');
    if (!box) return;
    const parent = box.closest('.stat');
    if (parent) parent.classList.add('is-urgent');
  }

  function clearUrgent() {
    document.querySelectorAll('.stat.is-urgent').forEach(el => {
      el.classList.remove('is-urgent');
    });
  }

  function overlay(title, msg, dead) {
    const el = document.getElementById('gameOverlay');
    if (!el) return;
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMsg').textContent = msg;
    el.classList.toggle('is-dead', !!dead);
    el.hidden = false;
  }

  function hideOverlay() {
    const el = document.getElementById('gameOverlay');
    if (el) el.hidden = true;
  }

  function toast(msg, kind) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;

    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' is-' + kind : '');
    t.textContent = msg;
    stack.appendChild(t);

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'opacity .2s, transform .2s';
      setTimeout(() => t.remove(), 220);
    }, CFG.toastMs || 3000);
  }

  function showResult(data) {
    document.getElementById('resultMode').textContent = data.modeLabel || '';
    document.getElementById('resultRank').textContent = data.rank || '';
    document.getElementById('resultWpm').textContent = data.wpm;
    document.getElementById('resultAcc').textContent = data.acc;
    document.getElementById('resultErrors').textContent = data.errors;
    document.getElementById('resultConsist').textContent = data.consistency || 0;

    const pb = document.getElementById('resultPB');
    if (pb) pb.hidden = !data.newPB;

    if (data.samples && window.drawWpmGraph) {
      window.drawWpmGraph(data.samples);
    }

    show('result');
  }

  function focusTypingArea() {
    const input = document.getElementById('hiddenInput');
    if (input) input.focus();
  }

  function tickSoundIcon(on) {
    const btn = document.getElementById('soundToggle');
    if (btn) btn.textContent = on ? '🔊' : '🔇';
  }

  function setTheme(name) {
    document.body.classList.remove('theme-neon', 'theme-midnight', 'theme-paper');
    document.body.classList.add('theme-' + name);
  }

  function setLobbyVisible(visible) {
    const p = document.getElementById('roomPanel');
    if (p) p.hidden = !visible;
  }

  function setRoomCode(code) {
    const el = document.getElementById('roomCodeLabel');
    if (el) el.textContent = code || '----';
  }

  function renderPlayers(list) {
    const ul = document.getElementById('playerList');
    if (!ul) return;
    ul.innerHTML = '';
    list.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.name;
      if (p.host) li.classList.add('is-host');
      ul.appendChild(li);
    });
  }

  function enableStart(on, label) {
    const btn = document.getElementById('startRaceBtn');
    if (!btn) return;
    btn.disabled = !on;
    if (label) btn.textContent = label;
  }

  function boardRows(rows) {
    const body = document.getElementById('boardBody');
    const empty = document.getElementById('boardEmpty');
    if (!body) return;

    body.innerHTML = '';

    if (!rows || !rows.length) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    rows.forEach((r, i) => {
      const tr = document.createElement('tr');
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
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  return {
    init,
    show,
    currentScreen,
    setGameModeTag,
    setStat,
    setProgress,
    setProgressText,
    pulseStat,
    urgentTimer,
    clearUrgent,
    overlay,
    hideOverlay,
    toast,
    showResult,
    focusTypingArea,
    tickSoundIcon,
    setTheme,
    setLobbyVisible,
    setRoomCode,
    renderPlayers,
    enableStart,
    boardRows,
  };

})();

window.UI = UI;