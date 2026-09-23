const Store = (() => {

  const KEY = 'typearena';

  const defaults = {
    pbWpm: 0,
    pbAcc: 0,
    pbCount: 0,
    streak: 0,
    lastPlayed: null,
    lastName: '',
    lastMode: 'timed',
    sound: true,
    theme: 'neon',
  };

  let state = { ...defaults };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { ...defaults, ...parsed };
      }
    } catch (e) {
      state = { ...defaults };
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // storage disabled or full, skip
    }
  }

  function get(key) {
    return key ? state[key] : state;
  }

  function set(key, value) {
    state[key] = value;
    save();
  }

  function recordRun({ wpm, acc, mode }) {
    const oldWpm = state.pbWpm;
    const oldAcc = state.pbAcc;

    state.pbCount += 1;
    state.lastMode = mode;

    if (wpm > state.pbWpm) state.pbWpm = wpm;
    if (acc > state.pbAcc) state.pbAcc = acc;

    bumpStreak();
    save();

    return {
      newWpm: wpm > oldWpm,
      newAcc: acc > oldAcc,
    };
  }

  function bumpStreak() {
    const today = new Date().toDateString();
    if (state.lastPlayed === today) return;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streak = state.lastPlayed === yesterday ? state.streak + 1 : 1;
    state.lastPlayed = today;
  }

  function reset() {
    state = { ...defaults };
    save();
  }

  return { load, save, get, set, recordRun, reset };

})();

window.Store = Store;