const FB = (() => {

  let db = null;
  let ready = false;
  let roomRef = null;
  let roomListener = null;

  function init() {
    if (CFG.offline) return false;
    const cfg = window.FB_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) return false;

    try {
      firebase.initializeApp(cfg);
      db = firebase.database();
      ready = true;
      return true;
    } catch (e) {
      console.warn('firebase init failed', e);
      ready = false;
      return false;
    }
  }

  function isReady() {
    return ready;
  }


  function submitScore(entry) {
    if (!ready) return Promise.resolve(false);
    const ref = db.ref('scores').push();
    return ref.set({
      name: clean(entry.name) || 'guest',
      wpm: entry.wpm | 0,
      acc: entry.acc | 0,
      mode: entry.mode || 'timed',
      ts: firebase.database.ServerValue.TIMESTAMP,
    }).then(() => true).catch(() => false);
  }

  function fetchBoard(range, limit) {
    if (!ready) return Promise.resolve([]);
    limit = limit || 50;

    let ref = db.ref('scores').orderByChild('wpm').limitToLast(limit);

    if (range === 'week' || range === 'today') {
      const ms = range === 'today' ? 86400000 : 7 * 86400000;
      const cutoff = Date.now() - ms;
 
      ref = db.ref('scores')
        .orderByChild('ts')
        .startAt(cutoff)
        .limitToLast(limit);
    }

    return ref.once('value').then(snap => {
      const out = [];
      snap.forEach(child => {
        const v = child.val() || {};
        out.push({
          name: v.name || 'guest',
          wpm: v.wpm || 0,
          acc: v.acc || 0,
          mode: v.mode || 'timed',
          ts: v.ts || 0,
        });
      });
      return out.sort((a, b) => b.wpm - a.wpm).slice(0, limit);
    }).catch(() => []);
  }


  function makeCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let s = '';
    for (let i = 0; i < (CFG.roomCodeLen || 4); i++) {
      s += A[Math.floor(Math.random() * A.length)];
    }
    return s;
  }

  function createRoom(opts) {
    if (!ready) return Promise.reject(new Error('offline'));

    const code = makeCode();
    const ref = db.ref('rooms/' + code);

    const room = {
      host: opts.name || 'guest',
      mode: opts.mode || 'timed-30',
      created: firebase.database.ServerValue.TIMESTAMP,
      status: 'waiting',
      players: {},
    };

    room.players[opts.name || 'guest'] = {
      host: true,
      joined: firebase.database.ServerValue.TIMESTAMP,
      wpm: 0,
      acc: 100,
      progress: 0,
      done: false,
    };

    return ref.set(room).then(() => code);
  }

  function joinRoom(code, name) {
    if (!ready) return Promise.reject(new Error('offline'));
    code = (code || '').toUpperCase().trim();
    if (!code) return Promise.reject(new Error('no code'));

    const ref = db.ref('rooms/' + code);
    return ref.once('value').then(snap => {
      if (!snap.exists()) throw new Error('not found');

      const room = snap.val();
      const count = Object.keys(room.players || {}).length;
      if (count >= (CFG.maxPlayers || 4)) throw new Error('full');

      return ref.child('players/' + name).set({
        host: false,
        joined: firebase.database.ServerValue.TIMESTAMP,
        wpm: 0,
        acc: 100,
        progress: 0,
        done: false,
      }).then(() => code);
    });
  }

  function watchRoom(code, cb) {
    if (!ready) return;
    unwatchRoom();

    roomRef = db.ref('rooms/' + code);
    roomListener = roomRef.on('value', snap => {
      cb(snap.val() || null);
    });
  }

  function unwatchRoom() {
    if (roomRef && roomListener) {
      roomRef.off('value', roomListener);
    }
    roomRef = null;
    roomListener = null;
  }

  function pushProgress(code, name, data) {
    if (!ready || !code) return;
    db.ref('rooms/' + code + '/players/' + name).update({
      wpm: data.wpm | 0,
      acc: data.acc | 0,
      progress: data.progress || 0,
      done: !!data.done,
    });
  }

  function startRace(code) {
    if (!ready) return Promise.resolve(false);
    return db.ref('rooms/' + code).update({ status: 'racing' })
      .then(() => true).catch(() => false);
  }

  function leaveRoom(code, name) {
    if (!ready || !code) return Promise.resolve();
    return db.ref('rooms/' + code + '/players/' + name).remove()
      .catch(() => {});
  }

  function clean(s) {
    return String(s || '').replace(/[^\w\s\-]/g, '').slice(0, 14).trim();
  }

  return {
    init,
    isReady,
    submitScore,
    fetchBoard,
    createRoom,
    joinRoom,
    watchRoom,
    unwatchRoom,
    pushProgress,
    startRace,
    leaveRoom,
  };

})();

window.FB = FB;
