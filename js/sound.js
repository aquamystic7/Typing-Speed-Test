const Sound = (() => {

  let enabled = true;
  let volume = 0.35;

  const files = {
    key: 'assets/sounds/key.mp3',
    wrong: 'assets/sounds/wrong.mp3',
    finish: 'assets/sounds/finish.mp3',
  };

  const cache = {};

  function load() {
    for (const name in files) {
      const audio = new Audio(files[name]);
      audio.preload = 'auto';
      audio.volume = volume;
      cache[name] = audio;
    }
  }

  function play(name) {
    if (!enabled) return;
    const audio = cache[name];
    if (!audio) return;

    try {
      audio.currentTime = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {
    }
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  function isOn() {
    return enabled;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    for (const name in cache) {
      cache[name].volume = volume;
    }
  }

  return {
    load,
    play,
    toggle,
    isOn,
    setVolume,
  };

})();

window.Sound = Sound;
