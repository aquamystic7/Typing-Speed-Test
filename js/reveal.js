// reveal.js
// the image grid. the whole gimmick of the site.
// typing.js calls Reveal.reveal(i) for every correct char.

const Reveal = (() => {

  let gridEl = null;
  let tiles = [];
  let imgSrc = null;
  let cols = 0;
  let rows = 0;

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function pickImage() {
    const n = Math.max(1, CFG.imageCount || 1);
    const idx = 1 + Math.floor(Math.random() * n);
    return CFG.imageFolder + pad(idx) + CFG.imageExt;
  }

  function preload(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('missing: ' + src));
      img.src = src;
    });
  }

  function sizeGrid(nChars, img) {
    const w = img.naturalWidth || 16;
    const h = img.naturalHeight || 9;
    const ar = w / h;

    cols = Math.max(1, Math.round(Math.sqrt(nChars * ar)));
    rows = Math.max(1, Math.ceil(nChars / cols));

    // if the bottom row only has a couple tiles, shave a column so it
    // looks less lopsided. took me ages to notice this looked bad.
    if (rows > 1) {
      const lastRow = nChars - (rows - 1) * cols;
      if (lastRow < cols / 3) {
        cols = Math.max(1, cols - 1);
        rows = Math.ceil(nChars / cols);
      }
    }
  }

  function build(text) {
    if (!gridEl) gridEl = document.getElementById('revealGrid');
    if (!gridEl) return Promise.resolve(false);

    const n = text.length;
    const src = pickImage();

    return preload(src).then(img => {
      imgSrc = src;
      sizeGrid(n, img);

      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      gridEl.classList.remove('done');
      gridEl.classList.add('idle');

      // this is the trick. bg-size scales the image up so each tile sees
      // one slice. position percentages line the slice up.
      const bgSize = `${cols * 100}% ${rows * 100}%`;

      const frag = document.createDocumentFragment();
      tiles = [];

      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;

        const x = cols > 1 ? (c / (cols - 1)) * 100 : 0;
        const y = rows > 1 ? (r / (rows - 1)) * 100 : 0;

        const t = document.createElement('div');
        t.className = 'tile';
        t.style.backgroundImage = `url(${src})`;
        t.style.backgroundSize = bgSize;
        t.style.backgroundPosition = `${x}% ${y}%`;

        frag.appendChild(t);
        tiles.push(t);
      }

      gridEl.appendChild(frag);
      return true;
    }).catch(() => {
      // no image, no grid. everything else keeps working.
      gridEl.innerHTML = '';
      tiles = [];
      return false;
    });
  }

  function reveal(i) {
    const t = tiles[i];
    if (!t) return;
    if (t.classList.contains('on')) return;
    t.classList.remove('rev');
    t.classList.add('on');
  }

  // backspace over a correct char. dims it but keeps some colour so the
  // user can see they already got it once.
  function unreveal(i) {
    const t = tiles[i];
    if (!t) return;
    t.classList.remove('on');
    t.classList.add('rev');
  }

  function wake() {
    if (gridEl) gridEl.classList.remove('idle');
  }

  function finish() {
    if (!gridEl) return;
    gridEl.classList.add('done');
    for (const t of tiles) {
      if (!t.classList.contains('on')) t.classList.add('on');
    }
  }

  function clear() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    gridEl.classList.remove('done', 'idle');
    tiles = [];
    imgSrc = null;
  }

  return {
    build,
    reveal,
    unreveal,
    wake,
    finish,
    clear,
  };

})();

window.Reveal = Reveal;