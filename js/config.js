// config.js
// all the knobs in one place. if you're typing a number somewhere else
// that isn't 0, 1, or 100, it probably belongs here instead.

const CFG = {

  // ---------- timed mode ----------
  durations: [15, 30, 60],
  defaultDuration: 30,

  // ---------- survival ----------
  // how many errors before you're dead. 1 is brutal, 3 is fair.
  survivalLives: 1,

  // ---------- zen ----------
  // how long a zen session runs before it wraps. basically just stops
  // the timer from growing forever.
  zenCap: 300,

  // ---------- text lengths ----------
  // how many words to pull for each mode
  wordsFor: {
  15: 15,
  30: 25,
  60: 40,
},
  survivalWords: 25,
  quoteMinChars: 80,

  // ---------- code mode ----------
  codeLangs: ['js', 'html', 'py'],

  // ---------- reveal grid ----------
  // images live in assets/images/ and are named 01.jpg, 02.jpg, ...
  // bump this when you add more. or set to null and reveal.js
  // will probe until it 404s (slower, don't do it in production)
  imageCount: 3,
  imageFolder: 'assets/images/',
  imageExt: '.jpg',

  // reveal behaviour
  revealFlash: true,       // the white blip when a tile lights up
  revealIdleDim: true,     // dim the whole grid before first keystroke

  // ---------- ranks ----------
  // wpm thresholds. tweak once you have real data, these are guesses.
  rankTiers: [
    { name: 'Bronze',   min: 0   },
    { name: 'Silver',   min: 30  },
    { name: 'Gold',     min: 50  },
    { name: 'Platinum', min: 70  },
    { name: 'Diamond',  min: 90  },
    { name: 'Master',   min: 110 },
    { name: 'Grandmaster', min: 130 },
  ],

  // ---------- multiplayer ----------
  maxPlayers: 4,
  roomCodeLen: 4,
  // how long a lobby sits empty before firebase cleans it up (seconds)
  roomTTL: 900,

  // ---------- sounds ----------
  sounds: {
    key: 'assets/sounds/key.mp3',
    wrong: 'assets/sounds/wrong.mp3',
    finish: 'assets/sounds/finish.mp3',
  },
  volume: 0.35,

  // ---------- ui ----------
  // how long the "new PB" badge stays up before it fades
  pbBadgeMs: 4000,
  toastMs: 3000,

  // ---------- dev ----------
  // set true to skip firebase entirely. single player + local scores only.
  offline: false,

  // disable the caret blink when someone's actively typing. feels better.
  caretBlinkWhenIdleOnly: true,
};

// freeze it so nobody accidentally reassigns a nested key at 2am
Object.freeze(CFG);

// expose globally. no build step, no modules, so this is how it's done here.
window.CFG = CFG;