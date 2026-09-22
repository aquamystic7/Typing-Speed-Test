// words.js
// word pool for timed + survival. all lowercase, no punctuation.
// keep it to short/common words or the tests get frustrating.
// roughly ordered by frequency — most common first.

const WORDS = [
  // top 100ish
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","say","her",
  "she","or","an","will","my","one","all","would","there","their","what","so","up",
  "out","if","about","who","get","which","go","me","when","make","can","like","time",
  "no","just","him","know","take","people","into","year","your","good","some","could",
  "them","see","other","than","then","now","look","only","come","its","over","think",
  "also","back","after","use","two","how","our","work","first","well","way","even",
  "new","want","because","any","these","give","day","most","us",

  // 100-300
  "is","are","was","were","been","has","had","did","does","said","made","went",
  "took","came","saw","knew","got","found","gave","told","felt","left","kept",
  "began","seemed","helped","talked","turned","started","showed","heard","played",
  "ran","moved","lived","believed","brought","happened","wrote","sat","stood",
  "lost","paid","met","included","continued","set","learned","changed","led",
  "understood","watched","followed","stopped","created","spoke","read","spent",
  "grew","opened","walked","won","taught","offered","remembered","considered",
  "appeared","bought","waited","served","died","sent","expected","built","stayed",
  "fell","cut","reached","killed","remained",

  // everyday nouns
  "thing","man","world","life","hand","part","child","eye","woman","place","week",
  "case","point","government","company","number","group","problem","fact","home",
  "water","room","mother","area","money","story","month","lot","right","book",
  "job","word","business","issue","side","kind","head","house","service","friend",
  "father","power","hour","game","line","end","member","law","car","city","name",
  "team","minute","idea","kid","body","back","parent","face","level","office",
  "door","health","person","art","war","history","party","result","change","morning",
  "reason","research","girl","guy","moment","air","teacher","force","education",

  // common verbs
  "run","eat","drink","sleep","walk","sit","read","write","sing","dance","jump",
  "climb","swim","drive","ride","fly","cook","clean","wash","draw","paint",
  "listen","speak","ask","answer","help","try","need","feel","keep","let",
  "put","mean","become","leave","call","bring","happen","sit","stand","lose",
  "pay","meet","include","continue","learn","change","lead","understand","watch",
  "follow","stop","create","speak","read","spend","grow","open","walk","win",
  "teach","offer","remember","consider","appear","buy","wait","serve","die",
  "send","expect","build","stay","fall","cut","reach","kill","remain",

  // adjectives
  "big","small","large","little","long","short","high","low","old","young",
  "early","late","right","wrong","true","false","hard","soft","hot","cold",
  "warm","cool","dark","light","heavy","easy","fast","slow","strong","weak",
  "happy","sad","good","bad","best","worst","new","clean","dirty","rich","poor",
  "smart","kind","mean","quiet","loud","safe","free","full","empty","open","close",

  // colors + nature (people like seeing these)
  "red","blue","green","yellow","orange","purple","pink","black","white","gray",
  "tree","leaf","grass","flower","river","ocean","mountain","sky","cloud","rain",
  "snow","wind","fire","stone","sand","forest","field","road","path","bridge",

  // tech-ish (for the coders)
  "code","file","data","byte","cache","stack","queue","array","string","loop",
  "patch","build","debug","query","index","token","scope","class","type","value",
  "server","client","script","render","commit","branch","merge","push","pull","fork",

  // gaming-ish
  "level","score","quest","loot","spawn","checkpoint","speedrun","ranked","clutch",
  "combo","dodge","attack","defend","upgrade","buff","nerf","grind","carry","queue",
];

// pick N random words, no repeats inside the same run.
// doesn't avoid repeats across runs — that's fine, players don't notice.
function pickWords(n) {
  const pool = WORDS.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

// join with spaces, no trailing space. typing.js expects a plain string.
function getWordText(n) {
  return pickWords(n).join(" ");
}

// expose on window (no modules, remember)
window.WORDS = WORDS;
window.pickWords = pickWords;
window.getWordText = getWordText;