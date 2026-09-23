var WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","say","her",
  "she","or","an","will","my","one","all","would","there","their","what","so","up",
  "out","if","about","who","get","which","go","me","when","make","can","like","time",
  "no","just","him","know","take","people","into","year","your","good","some","could",
  "them","see","other","than","then","now","look","only","come","its","over","think",
  "also","back","after","use","two","how","our","work","first","well","way","even",
  "new","want","because","any","these","give","day","most","us",
  "is","are","was","were","been","has","had","did","does","said","made","went",
  "thing","man","world","life","hand","part","child","eye","woman","place","week",
  "run","eat","drink","sleep","walk","sit","read","write","sing","dance","jump",
  "big","small","large","little","long","short","high","low","old","young",
  "red","blue","green","yellow","orange","purple","pink","black","white","gray",
  "code","file","data","byte","cache","stack","queue","array","string","loop",
  "level","score","quest","loot","spawn","checkpoint","speedrun","ranked","clutch"
];

function pickWords(n) {
  var pool = WORDS.slice();
  var out = [];
  for (var i = 0; i < n && pool.length; i++) {
    var idx = Math.floor(Math.random() * pool.length);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}

function getWordText(n) {
  return pickWords(n).join(" ");
}

window.WORDS = WORDS;
window.pickWords = pickWords;
window.getWordText = getWordText;