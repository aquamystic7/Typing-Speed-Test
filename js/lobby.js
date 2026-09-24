const Lobby = (() => {

  let myName = '';
  let myRoom = '';
  let amHost = false;
  let watcher = null;
  let countdownTimer = null;

  function init() {
    wire('createRoomBtn', 'click', onCreate);
    wire('joinRoomBtn', 'click', onJoin);
    wire('copyCodeBtn', 'click', onCopy);
    wire('startRaceBtn', 'click', onStart);
    wire('leaveRoomBtn', 'click', onLeave);

    const hn = document.getElementById('hostName');
    const jn = document.getElementById('joinName');
    const saved = (window.Store && Store.get('lastName')) || '';

    if (hn && saved) hn.value = saved;
    if (jn && saved) jn.value = saved;

    const jc = document.getElementById('joinCode');
    if (jc) {
      jc.addEventListener('input', () => {
        jc.value = jc.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      });
    }

    checkAvailable();
  }

  function wire(id, ev, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  function checkAvailable() {
    if (!window.FB || !FB.isReady()) {

      const grid = document.querySelector('.lobby-split');
      if (grid) grid.setAttribute('data-offline', 'true');

      disable('createRoomBtn');
      disable('joinRoomBtn');

      if (window.UI) {
        UI.toast('Multiplayer is offline', 'warn');
      }
    }
  }

  function disable(id) {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  }

  function readName(inputId) {
    const el = document.getElementById(inputId);
    const name = (el && el.value || '').trim().slice(0, 14) || 'guest';
    if (window.Store) Store.set('lastName', name);
    return name;
  }

  function onCreate() {
    if (!window.FB || !FB.isReady()) {
      if (window.UI) UI.toast('Offline', 'bad');
      return;
    }

    myName = readName('hostName');
    amHost = true;

    const modeEl = document.getElementById('hostMode');
    const mode = (modeEl && modeEl.value) || 'timed-30';

    FB.createRoom({ name: myName, mode: mode }).then(code => {
      myRoom = code;
      if (window.UI) {
        UI.setLobbyVisible(true);
        UI.setRoomCode(code);
        UI.enableStart(false, 'Waiting for players…');
      }
      attachWatcher();
    }).catch(err => {
      if (window.UI) UI.toast('Could not create room', 'bad');
      console.warn(err);
    });
  }

  function onJoin() {
    if (!window.FB || !FB.isReady()) {
      if (window.UI) UI.toast('Offline', 'bad');
      return;
    }

    const codeEl = document.getElementById('joinCode');
    const code = (codeEl && codeEl.value || '').toUpperCase().trim();
    if (code.length !== (CFG.roomCodeLen || 4)) {
      if (window.UI) UI.toast('Enter the room code', 'warn');
      return;
    }

    myName = readName('joinName');
    amHost = false;

    FB.joinRoom(code, myName).then(c => {
      myRoom = c;
      if (window.UI) {
        UI.setLobbyVisible(true);
        UI.setRoomCode(c);
        UI.enableStart(false, 'Waiting for host');
      }
      attachWatcher();
    }).catch(err => {
      const msg = err && err.message === 'full'
        ? 'Room is full'
        : err && err.message === 'not found'
          ? 'No room with that code'
          : 'Could not join';
      if (window.UI) UI.toast(msg, 'bad');
    });
  }

  function onCopy() {
    if (!myRoom) return;
    const done = () => {
      if (window.UI) UI.toast('Code copied', 'ok');
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myRoom).then(done).catch(() => {
        fallbackCopy(myRoom, done);
      });
    } else {
      fallbackCopy(myRoom, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }

  function onStart() {
    if (!amHost || !myRoom) return;
    FB.startRace(myRoom).then(ok => {
      if (!ok && window.UI) UI.toast('Could not start', 'bad');
    });
  }

  function onLeave() {
    if (window.FB) FB.leaveRoom(myRoom, myName);
    if (window.FB) FB.unwatchRoom();
    reset();
  }

  function reset() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    myRoom = '';
    amHost = false;
    if (window.UI) {
      UI.setLobbyVisible(false);
      UI.setRoomCode('');
      UI.renderPlayers([]);
      UI.enableStart(false, 'Waiting for players…');
    }
  }

  function attachWatcher() {
    if (!window.FB) return;
    FB.unwatchRoom();
    FB.watchRoom(myRoom, onRoomUpdate);
  }

  function onRoomUpdate(room) {
    if (!room) {
    
      if (window.UI) UI.toast('Room closed', 'warn');
      reset();
      return;
    }

    const players = [];
    for (const name in (room.players || {})) {
      const p = room.players[name];
      players.push({
        name: name,
        host: !!p.host,
        wpm: p.wpm || 0,
        progress: p.progress || 0,
        done: !!p.done,
      });
    }

    if (window.UI) UI.renderPlayers(players);

    if (room.status === 'racing') {
      startRaceView(room);
    } else if (amHost) {
      const enough = players.length >= 2;
      if (window.UI) {
        UI.enableStart(enough, enough ? 'Start race' : 'Waiting for players…');
      }
    }
  }

  function startRaceView(room) {
    if (countdownTimer) return;

    let n = 3;
    if (window.UI) {
      UI.overlay(String(n), 'Get ready…', false);
    }

    countdownTimer = setInterval(() => {
      n--;
      if (n > 0) {
        if (window.UI) UI.overlay(String(n), 'Get ready…', false);
        return;
      }

      clearInterval(countdownTimer);
      countdownTimer = null;
      if (window.UI) UI.hideOverlay();
      emitStart(room);
    }, 800);
  }

  function emitStart(room) {
    const mode = room.mode || 'timed-30';
    const [type, duration] = mode.split('-');

    if (window.App && App.beginRace) {
      App.beginRace({
        mode: type,
        duration: parseInt(duration, 10) || 30,
        room: myRoom,
        me: myName,
      });
    }
  }

  function pushProgress(snapshot, done) {
    if (!myRoom || !window.FB) return;
    FB.pushProgress(myRoom, myName, {
      wpm: snapshot.wpm,
      acc: snapshot.acc,
      progress: snapshot.progress,
      done: !!done,
    });
  }

  function room() {
    return myRoom;
  }

  function me() {
    return myName;
  }

  return {
    init,
    pushProgress,
    room,
    me,
  };

})();

window.Lobby = Lobby;
