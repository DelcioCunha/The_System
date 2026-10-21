document.fonts.ready.then(function () {
  function newPage(title) {
    var s = document.createElement('section');
    s.className = 'page text';
    s.innerHTML = '<div class="frame"></div><div class="rh"><span>CRÓNICAS DO SISTEMA</span><span>' + title + '</span></div><div class="inner"></div><div class="foot"><span></span><span class="fn"></span></div>';
    return s;
  }
  function fits(inner) { return inner.scrollHeight <= inner.clientHeight + 1; }
  function splitPara(p, inner) {
    // tenta colocar parte do parágrafo nesta página; devolve o resto (ou null)
    var words = p.textContent.split(' '), lo = 0, hi = words.length, best = 0;
    var cls = p.className;
    var probe = document.createElement('p'); probe.className = cls; inner.appendChild(probe);
    while (lo <= hi) { var mid = (lo + hi) >> 1; probe.textContent = words.slice(0, mid).join(' '); if (fits(inner)) { best = mid; lo = mid + 1; } else hi = mid - 1; }
    if (best < 8) { inner.removeChild(probe); return p; }
    probe.textContent = words.slice(0, best).join(' ');
    probe.classList.add('cont-a');
    var rest = document.createElement('p'); rest.className = cls.replace('drop', '') + ' cont-b'; rest.textContent = words.slice(best).join(' ');
    return rest;
  }
  document.querySelectorAll('.flow').forEach(function (flow) {
    var title = flow.getAttribute('data-title');
    var els = Array.prototype.slice.call(flow.children);
    var page = newPage(title); flow.parentNode.insertBefore(page, flow);
    var inner = page.querySelector('.inner');
    var queue = els.slice();
    while (queue.length) {
      var el = queue.shift();
      inner.appendChild(el);
      if (fits(inner)) continue;
      inner.removeChild(el);
      if (el.tagName === 'P' && el.classList.contains('nar')) {
        var rest = splitPara(el, inner);
        if (rest !== el) { queue.unshift(rest); }
        else queue.unshift(el);
      } else queue.unshift(el);
      if (!inner.children.length) { inner.appendChild(queue.shift()); }
      page = newPage(title); flow.parentNode.insertBefore(page, flow); inner = page.querySelector('.inner');
    }
    flow.remove();
  });
  // números de página
  var all = document.querySelectorAll('.page');
  all.forEach(function (p, i) { var fn = p.querySelector('.fn'); if (fn) fn.textContent = i + 1; p.setAttribute('data-n', i + 1); });
  // índice
  var toc = document.getElementById('toc').querySelector('.inner');
  var h = '<h2 class="ch">Índice</h2><div class="toc cr-toc">';
  TOC.forEach(function (t) { var el = document.getElementById(t[2]); var n = el ? el.getAttribute('data-n') : '?'; h += '<div class="ti ' + (t[0] === 'part' ? 'main' : '') + '"><span class="tt">' + t[1] + '</span><span class="tp">' + n + '</span></div>'; });
  toc.innerHTML = h + '</div>';
  window.__done = all.length;
});
