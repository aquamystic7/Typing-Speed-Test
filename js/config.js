const CFG = {

  durations: [15, 30, 60],
  defaultDuration: 30,

  survivalLives: 1,


  zenCap: 300,


  wordsFor: {
  15: 15,
  30: 25,
  60: 40,
},
  survivalWords: 25,
  quoteMinChars: 80,

  codeLangs: ['js', 'html', 'py'],

 
  imageCount: 3,
  imageFolder: 'assets/images/',
  imageExt: '.jpg',

  revealFlash: true,      
  revealIdleDim: true,    

  rankTiers: [
    { name: 'Bronze',   min: 0   },
    { name: 'Silver',   min: 30  },
    { name: 'Gold',     min: 50  },
    { name: 'Platinum', min: 70  },
    { name: 'Diamond',  min: 90  },
    { name: 'Master',   min: 110 },
    { name: 'Grandmaster', min: 130 },
  ],

  maxPlayers: 4,
  roomCodeLen: 4,
 
  roomTTL: 900,

  sounds: {
    key: 'assets/sounds/key.mp3',
    wrong: 'assets/sounds/wrong.mp3',
    finish: 'assets/sounds/finish.mp3',
  },
  volume: 0.35,

  pbBadgeMs: 4000,
  toastMs: 3000,

  offline: false,

  caretBlinkWhenIdleOnly: true,
};

Object.freeze(CFG);

window.CFG = CFG;
