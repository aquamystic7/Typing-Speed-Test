const QUOTES = [

  // movies
  "May the Force be with you.",
  "I'm going to make him an offer he can't refuse.",
  "You talking to me?",
  "Here's looking at you, kid.",
  "Go ahead, make my day.",
  "I'll be back.",
  "Why so serious?",
  "I am your father.",
  "There's no place like home.",
  "Houston, we have a problem.",
  "You can't handle the truth.",
  "Keep your friends close, but your enemies closer.",
  "Life is like a box of chocolates.",
  "To infinity and beyond.",
  "Just keep swimming.",

  // books
  "It was the best of times, it was the worst of times.",
  "All animals are equal, but some animals are more equal than others.",
  "Call me Ishmael.",
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "The answer to the ultimate question of life, the universe, and everything is forty-two.",
  "Not all those who wander are lost.",
  "It does not do to dwell on dreams and forget to live.",
  "So we beat on, boats against the current, borne back ceaselessly into the past.",
  "There is no friend as loyal as a book.",
  "We are what we pretend to be, so we must be careful about what we pretend to be.",

  // programmers
  "Talk is cheap. Show me the code.",
  "Programs must be written for people to read, and only incidentally for machines to execute.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Premature optimization is the root of all evil.",
  "Simplicity is the ultimate sophistication.",
  "First, solve the problem. Then, write the code.",
  "Make it work, make it right, make it fast.",
  "The best error message is the one that never shows up.",
  "Deleted code is debugged code.",
  "Weeks of coding can save you hours of planning.",

  // misc
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish.",
  "Whether you think you can or you think you can't, you're right.",
  "The journey of a thousand miles begins with a single step.",
  "In the middle of difficulty lies opportunity.",
  "Everything should be made as simple as possible, but not simpler.",
  "Imagination is more important than knowledge.",
  "The unexamined life is not worth living.",
  "Knowing yourself is the beginning of all wisdom.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",

   // my favourite music 
  "I broke you just to own you.",
];

function pickQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

window.QUOTES = QUOTES;
window.pickQuote = pickQuote;