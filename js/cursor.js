// little glowing dot that follows the mouse
// skips itself entirely on touch devices
const Cursor = (function () {

  var dot, mx = 0, my = 0, cx = 0, cy = 0;

  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    dot = document.createElement('div');
    dot.id = 'cursorDot';
    document.body.appendChild(dot);
    document.body.classList.add('has-cursor');

    window.addEventListener('mousemove', track, { passive: true });
    window.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);

    bindHover();
    requestAnimationFrame(step);
  }

  function track(e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.opacity = 1;
  }

  function press() {
    dot.style.transform = 'translate(-50%,-50%) scale(.7)';
  }

  function release() {
    dot.style.transform = 'translate(-50%,-50%) scale(1)';
  }

  // lerp the dot toward the real mouse position so it trails slightly.
  // 0.22 felt right after trying .15 (too laggy) and .35 (basically instant)
  function step() {
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    dot.style.left = cx + 'px';
    dot.style.top = cy + 'px';
    requestAnimationFrame(step);
  }

  function bindHover() {
    var sel = 'a,button,.mode-card,input,select,.tab';

    function attach(el) {
      if (el.dataset.hov) return;
      el.dataset.hov = '1';
      el.onmouseenter = function () { dot.classList.add('hover'); };
      el.onmouseleave = function () { dot.classList.remove('hover'); };
    }

    document.querySelectorAll(sel).forEach(attach);

    // things get added later (leaderboard rows, toasts, whatever)
    // so watch the dom and hook new elements as they show up
    new MutationObserver(function () {
      document.querySelectorAll(sel).forEach(attach);
    }).observe(document.body, { childList: true, subtree: true });
  }

  return { init: init };

})();

window.Cursor = Cursor;