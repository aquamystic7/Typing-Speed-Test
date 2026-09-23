// typing.js
// the engine. this is the file that actually runs a test.
// everything else (modes, ui, reveal, sound) is scaffolding around this.

const Typing = (() => {

  const state = {
    text: '',
    chars: [],        // { el, target }
    typed: [],        // what the user has typed so far
    pos: 0,
    errors: 0,
    correct: 0,
    startedAt: 0,
    endedAt: 0,
    running: false,
    finished: false,
    wakeFired: false,
  };

  let callbacks = {};
  let els = {};
  let inputEl = null;
  let textEl = null;

  function init(opts) {
    callbacks = opts || {};
    els.text = document.getElementById('typeText');
    els.input = document.getElementById('hiddenInput');
    els.caret = null;

    if (!els.text || !els.input) {
      console.warn('typing.js: missing DOM elements');
      return;
    }

    textEl = els.text;
    inputEl = els.input;

    // hidden input is the thing that actually gets keystrokes.
    // typeText is just a display target.
    inputEl.addEventListener('input', onInput);
    inputEl.addEventListener('keydown', onKeyDown);
    textEl.addEventListener('click', focusInput);
  }

  function focusInput() {
    if (inputEl) inputEl.focus();
  }

  function start(text) {
    if (!text || !text.length) return;

    state.text = text;
    state.typed = [];
    state.pos = 0;
    state.errors = 0;
    state.correct = 0;
    state.startedAt = 0;
    state.endedAt = 0;
    state.running = true;
    state.finished = false;
    state.wakeFired = false;

    render(text);
    placeCaret(0);
    focusInput();

    if (inputEl) inputEl.value = '';

    if (callbacks.onStart) callbacks.onStart();
  }

  function render(text) {
    textEl.innerHTML = '';
    state.chars = [];

    const frag = document.createDocumentFragment();

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = text[i];
      frag.appendChild(span);
      state.chars.push({ el: span, target: text[i] });
    }

    // caret is a sibling of the char spans so it can sit between them
    const caret = document.createElement('span');
    caret.className = 'caret is-idle';
    caret.setAttribute('aria-hidden', 'true');
    textEl.appendChild(frag);
    textEl.appendChild(caret);
    els.caret = caret;
  }

  function onKeyDown(e) {
    if (!state.running) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
      return;
    }

    // tab + enter to restart, same as monkeytype
    if (e.key === 'Tab') {
      e.preventDefault();
    }
  }

  function onInput(e) {
    if (!state.running) {
      inputEl.value = '';
      return;
    }

    const value = inputEl.value;
    if (!value) return;

    // process each char that came in. most of the time it's one, but
    // paste or fast typing can deliver more than one at a time.
    for (const ch of value) {
      key(ch);
    }

    inputEl.value = '';
  }

  function key(ch) {
    if (!state.running || state.finished) return;
    if (state.pos >= state.text.length) return;

    if (!state.startedAt) {
      state.startedAt = performance.now();
    }

    if (!state.wakeFired) {
      state.wakeFired = true;
      if (callbacks.onFirstKey) callbacks.onFirstKey();
    }

    const expected = state.text[state.pos];
    const el = state.chars[state.pos].el;
    const ok = ch === expected;

    if (ok) {
      el.classList.add('ok');
      state.correct++;
      if (callbacks.onCharCorrect) callbacks.onCharCorrect(state.pos);
    } else {
      el.classList.add('bad');
      state.errors++;
      if (callbacks.onCharWrong) callbacks.onCharWrong(state.pos);
    }

    state.typed.push(ch);
    state.pos++;

    placeCaret(state.pos);
    tick();

    if (state.pos >= state.text.length) {
      finish();
    }
  }

  function backspace() {
    if (!state.running) return;
    if (state.pos === 0) return;

    const i = state.pos - 1;
    const el = state.chars[i].el;
    const wasOk = el.classList.contains('ok');

    el.classList.remove('ok', 'bad');

    if (wasOk) state.correct--;
    state.typed.pop();
    state.pos--;

    placeCaret(state.pos);

    if (callbacks.onCharUndo) callbacks.onCharUndo(i, wasOk);
    tick();
  }

  function placeCaret(i) {
    if (!els.caret || !state.chars.length) return;

    const target = state.chars[Math.min(i, state.chars.length - 1)];
    if (!target) return;

    const el = target.el;
    const rect = el.getBoundingClientRect();
    const parentRect = textEl.getBoundingClientRect();

    // char height and offset, so the caret sits next to the char not on top
    const top = el.offsetTop;
    let left = el.offsetLeft;

    if (i >= state.chars.length) {
      left = el.offsetLeft + el.offsetWidth;
    }

    els.caret.style.top = top + 'px';
    els.caret.style.left = left + 'px';
  }

  function tick() {
    if (!callbacks.onProgress) return;

    const s = snapshot();
    callbacks.onProgress(s);
  }

  function snapshot() {
    const elapsed = state.startedAt ? (performance.now() - state.startedAt) / 1000 : 0;
    const mins = elapsed / 60;

    // standard: 1 word = 5 chars. gross wpm, not net.
    const wpm = mins > 0 ? Math.round((state.pos / 5) / mins) : 0;

    const acc = state.pos > 0
      ? Math.round((state.correct / state.pos) * 100)
      : 100;

    return {
      wpm,
      acc,
      errors: state.errors,
      correct: state.correct,
      pos: state.pos,
      total: state.text.length,
      elapsed,
      progress: state.text.length ? state.pos / state.text.length : 0,
    };
  }

  function finish() {
    if (state.finished) return;
    state.finished = true;
    state.running = false;
    state.endedAt = performance.now();

    const s = snapshot();
    if (callbacks.onComplete) callbacks.onComplete(s);
    if (callbacks.onFinish) callbacks.onFinish(s);
  }

  function stop() {
    state.running = false;
    if (inputEl) inputEl.value = '';
  }

  function reset() {
    stop();
    state.text = '';
    state.chars = [];
    state.typed = [];
    state.pos = 0;
    state.errors = 0;
    state.correct = 0;
    state.startedAt = 0;
    state.endedAt = 0;
    state.finished = false;
    state.wakeFired = false;
    if (textEl) textEl.innerHTML = '';
  }

  function isRunning() {
    return state.running;
  }

  function isFinished() {
    return state.finished;
  }

  // sets an urgent state on the timer, called by modes.js when time is short
  function shake() {
    if (!textEl) return;
    textEl.classList.add('is-shaking');
    setTimeout(() => textEl.classList.remove('is-shaking'), 220);
  }

  return {
    init,
    start,
    stop,
    reset,
    key,
    backspace,
    focus: focusInput,
    isRunning,
    isFinished,
    shake,
    snapshot,
  };

})();

window.Typing = Typing;