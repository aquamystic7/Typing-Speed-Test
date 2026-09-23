const Modes = (function () {

  var cfg = {
    mode: 'timed',
    duration: 30,
    customText: ''
  };

  var tick = null;
  var deadline = 0;
  var lives = 1;
  var handlersCb = {};

  function start(mode, opts) {
    opts = opts || {};
    cfg.mode = mode;
    cfg.duration = opts.duration || CFG.defaultDuration;
    cfg.customText = opts.text || '';

    var text = buildText(mode, opts);
    if (!text) return Promise.resolve(false);

    return Reveal.build(text).then(function () {
      reset();
      arm();
      Typing.start(text);

      if (mode === 'timed') startTimer(cfg.duration);
      if (mode === 'zen') startZen();
      if (mode === 'survival') lives = CFG.survivalLives || 1;
    });
  }

  function buildText(mode, opts) {
    if (mode === 'timed') {
      return getWordText(CFG.wordsFor[cfg.duration] || 80);
    }
    if (mode === 'survival') {
      return getWordText(CFG.survivalWords || 200);
    }
    if (mode === 'quote') {
      return pickQuote();
    }
    if (mode === 'code') {
      var lang = (opts && opts.lang) || CFG.codeLangs[0];
      return pickSnippet(lang);
    }
    if (mode === 'custom') {
      return (cfg.customText || '').trim();
    }
    if (mode === 'zen') {
      return getWordText(150);
    }
    return getWordText(80);
  }

  function reset() {
    if (tick) {
      clearInterval(tick);
      tick = null;
    }
    deadline = 0;
  }

  function arm() {
    Typing.init({
      onFirstKey: onFirstKey,
      onCharCorrect: onCharCorrect,
      onCharWrong: onCharWrong,
      onCharUndo: onCharUndo,
      onProgress: onProgress,
      onComplete: onComplete
    });
  }

  function startTimer(seconds) {
    deadline = performance.now() + seconds * 1000;
    tick = setInterval(function () {
      var left = Math.max(0, (deadline - performance.now()) / 1000);
      var rounded = Math.ceil(left);

      if (handlersCb.onTick) handlersCb.onTick(rounded);
      if (left <= 5 && handlersCb.onUrgent) handlersCb.onUrgent();

      if (left <= 0) {
        clearInterval(tick);
        tick = null;
        Typing.stop();
        finish('time');
      }
    }, 100);
  }

  function startZen() {
    tick = setInterval(function () {
      var s = Typing.snapshot();
      if (handlersCb.onTick) handlersCb.onTick(null);
      if (s.pos >= s.total) {
        clearInterval(tick);
        tick = null;
        finish('done');
      }
    }, 100);
  }

  function handlers(h) {
    handlersCb = h || {};
  }

  function onFirstKey() {
    Reveal.wake();
    if (handlersCb.onFirstKey) handlersCb.onFirstKey();
  }

  function onCharCorrect(i) {
    Reveal.reveal(i);
    if (handlersCb.onCharCorrect) handlersCb.onCharCorrect(i);
  }

  function onCharWrong(i) {
    if (cfg.mode === 'survival') {
      lives--;
      Typing.shake();
      if (lives <= 0) {
        if (tick) {
          clearInterval(tick);
          tick = null;
        }
        Typing.stop();
        finish('dead');
        return;
      }
    } else {
      Typing.shake();
    }
    if (handlersCb.onCharWrong) handlersCb.onCharWrong(i);
  }

  function onCharUndo(i, wasOk) {
    if (wasOk) Reveal.unreveal(i);
    if (handlersCb.onCharUndo) handlersCb.onCharUndo(i, wasOk);
  }

  function onProgress(s) {
    if (handlersCb.onProgress) handlersCb.onProgress(s);
  }

  function onComplete(s) {
    Reveal.finish();
    if (tick) {
      clearInterval(tick);
      tick = null;
    }
    if (handlersCb.onComplete) handlersCb.onComplete(s);
    finish('done', s);
  }

  function finish(reason, snapshot) {
    reset();
    var s = snapshot || Typing.snapshot();
    if (handlersCb.onFinish) handlersCb.onFinish(reason, s);
  }

  function stop() {
    reset();
    Typing.stop();
  }

  return {
    start: start,
    stop: stop,
    finish: finish,
    handlers: handlers
  };

})();

window.Modes = Modes;