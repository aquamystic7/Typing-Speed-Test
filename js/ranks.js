var RANKS = [
  { name: 'Grandmaster', wpm: 130, color: 'var(--rank-gm)' },
  { name: 'Master',      wpm: 110, color: 'var(--rank-master)' },
  { name: 'Diamond',     wpm: 90,  color: 'var(--rank-diamond)' },
  { name: 'Platinum',    wpm: 70,  color: 'var(--rank-platinum)' },
  { name: 'Gold',        wpm: 50,  color: 'var(--rank-gold)' },
  { name: 'Silver',      wpm: 30,  color: 'var(--rank-silver)' },
  { name: 'Bronze',      wpm: 0,   color: 'var(--rank-bronze)' }
];

function rankFor(wpm) {
  if (!wpm || wpm < 0) return RANKS[RANKS.length - 1];
  for (var i = 0; i < RANKS.length; i++) {
    if (wpm >= RANKS[i].wpm) return RANKS[i];
  }
  return RANKS[RANKS.length - 1];
}

function nextRank(wpm) {
  var cur = rankFor(wpm);
  var idx = RANKS.indexOf(cur);
  if (idx === 0) return null;
  var next = RANKS[idx - 1];
  return { name: next.name, need: next.wpm - wpm, target: next.wpm };
}

function paintChip(el, wpm) {
  if (!el) return;
  var r = rankFor(wpm);

  el.setAttribute('data-rank', r.name);
  el.querySelector('#rankLabel').textContent = r.name;

  var dot = el.querySelector('.rank-dot');
  if (dot) {
    dot.style.background = r.color;
    dot.style.boxShadow = '0 0 8px ' + r.color;
  }
}

window.RANKS = RANKS;
window.rankFor = rankFor;
window.nextRank = nextRank;
window.paintChip = paintChip;