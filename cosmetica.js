/* ============================================================
   COSMETICA.JS — Farmasette
   ============================================================ */

'use strict';

/* ==========================================
   1. NAVBAR
   ========================================== */
(function initNavbar() {
  const nav = document.querySelector('nav');
  const btn = nav && nav.querySelector('.nav-toggle');
  if (!nav || !btn) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  }

  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  nav.addEventListener('click', function (e) {
    if (e.target.closest('.menu a, .cta-nav')) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 992) setOpen(false);
  });
})();

/* ==========================================
   2. TAB SYSTEM
   ========================================== */
function initTabs(sectionId) {
  var section = document.getElementById(sectionId);
  if (!section) return;

  var tabs   = Array.from(section.querySelectorAll('[role="tab"]'));
  var shell  = section.querySelector('.product-panel-shell');
  var tabsEl = section.querySelector('.product-tabs');

  function activateTab(tab, isInit) {
    /* deactivate all */
    tabs.forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });

    /* hide all panels */
    section.querySelectorAll('[role="tabpanel"]').forEach(function (p) {
      p.classList.remove('active');
      p.setAttribute('hidden', '');
    });

    /* activate selected tab */
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    /* show panel */
    var panelId = tab.getAttribute('aria-controls');
    var panel   = document.getElementById(panelId);
    if (!panel) return;

    panel.removeAttribute('hidden');
    panel.classList.add('active');

    /* animate shell in */
    if (shell) {
      shell.classList.remove('visible');
      /* double rAF ensures transition fires after display:grid is applied */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          shell.classList.add('visible');
        });
      });
    }

    /* center the selected tab horizontally — never scrolls the page */
    if (tabsEl && !isInit) {
      var cRect = tabsEl.getBoundingClientRect();
      var tRect = tab.getBoundingClientRect();
      tabsEl.scrollBy({
        left: (tRect.left - cRect.left) - (cRect.width - tRect.width) / 2,
        behavior: 'smooth'
      });
    }
  }

  /* click */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab); });
  });

  /* keyboard: ArrowLeft / ArrowRight navigation */
  section.addEventListener('keydown', function (e) {
    var focused = document.activeElement;
    if (!focused || !focused.matches('[role="tab"]')) return;
    var idx = tabs.indexOf(focused);
    if (idx === -1) return;

    var next;
    if (e.key === 'ArrowRight') {
      next = tabs[(idx + 1) % tabs.length];
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      next = tabs[(idx - 1 + tabs.length) % tabs.length];
      e.preventDefault();
    } else if (e.key === 'Home') {
      next = tabs[0];
      e.preventDefault();
    } else if (e.key === 'End') {
      next = tabs[tabs.length - 1];
      e.preventDefault();
    }

    if (next) {
      next.focus();
      activateTab(next);
    }
  });

  /* desktop scroll arrows */
  var wrap = section.querySelector('.product-tabs-wrap');

  if (wrap && tabsEl) {
    var prevBtn = document.createElement('button');
    var nextBtn = document.createElement('button');

    prevBtn.type = 'button';
    nextBtn.type = 'button';
    prevBtn.className = 'tab-scroll-btn tab-scroll-prev';
    nextBtn.className = 'tab-scroll-btn tab-scroll-next';
    prevBtn.setAttribute('aria-label', 'Scorri i prodotti verso sinistra');
    nextBtn.setAttribute('aria-label', 'Scorri i prodotti verso destra');
    prevBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    nextBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    wrap.insertBefore(prevBtn, tabsEl);
    wrap.appendChild(nextBtn);

    var updateScrollBtns = function () {
      var max = tabsEl.scrollWidth - tabsEl.clientWidth;
      var scrollable = max > 1;
      prevBtn.hidden = !scrollable;
      nextBtn.hidden = !scrollable;
      prevBtn.disabled = tabsEl.scrollLeft <= 1;
      nextBtn.disabled = tabsEl.scrollLeft >= max - 1;
    };

    /* scroll exactly one tab per click */
    var scrollByTab = function (dir) {
      var cont = tabsEl.getBoundingClientRect();
      var firstVisible = 0;
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getBoundingClientRect().right > cont.left + 1) {
          firstVisible = i;
          break;
        }
      }
      var targetIndex = Math.max(0, Math.min(tabs.length - 1, firstVisible + dir));
      var target = tabs[targetIndex];
      tabsEl.scrollBy({
        left: target.getBoundingClientRect().left - cont.left,
        behavior: 'smooth'
      });
    };

    prevBtn.addEventListener('click', function () { scrollByTab(-1); });
    nextBtn.addEventListener('click', function () { scrollByTab(1); });
    tabsEl.addEventListener('scroll', updateScrollBtns, { passive: true });
    window.addEventListener('resize', updateScrollBtns);
    updateScrollBtns();
  }

  /* init first tab */
  if (tabs.length > 0) {
    activateTab(tabs[0], true);
  }
}

/* init all three sections */
initTabs('corpo');
initTabs('viso');
initTabs('capelli');

/* ==========================================
   3. SCROLL REVEAL (IntersectionObserver)
   ========================================== */
(function initReveal() {
  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -36px 0px'
  });

  revealEls.forEach(function (el) { observer.observe(el); });
})();

/* ==========================================
   4. ANCHOR / HASH DEEP-LINK
   ========================================== */
(function initHashScroll() {
  var hash = decodeURIComponent(location.hash.replace('#', '').trim());
  if (!hash) return;

  /* give the DOM a moment to paint before scrolling */
  setTimeout(function () {
    var target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 120);
})();
