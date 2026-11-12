/* ЛБТЭК — интерактив главной страницы */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Тост ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3400);
  }

  /* ---------- Панель каталога ---------- */
  var catalogToggle = document.getElementById('catalog-toggle');
  var catalogPanel = document.getElementById('catalog-panel');
  if (catalogToggle && catalogPanel) {
    catalogToggle.addEventListener('click', function () {
      var open = catalogPanel.hidden;
      if (open) {
        catalogPanel.hidden = false;
        requestAnimationFrame(function () { catalogPanel.classList.add('open'); });
      } else {
        catalogPanel.classList.remove('open');
        catalogPanel.hidden = true;
      }
      catalogToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (catalogPanel.hidden) return;
      if (catalogPanel.contains(e.target) || catalogToggle.contains(e.target)) return;
      catalogPanel.hidden = true;
      catalogPanel.classList.remove('open');
      catalogToggle.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || catalogPanel.hidden) return;
      catalogPanel.hidden = true;
      catalogPanel.classList.remove('open');
      catalogToggle.setAttribute('aria-expanded', 'false');
      catalogToggle.focus();
    });
    catalogPanel.addEventListener('click', function (e) {
      if (!e.target.closest('a')) return;
      catalogPanel.hidden = true;
      catalogPanel.classList.remove('open');
      catalogToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Тень шапки при скролле ---------- */
  var header = document.getElementById('site-header');
  var headerTop = document.querySelector('.topline');
  function onScroll() {
    if (!header) return;
    var limit = headerTop ? headerTop.offsetHeight + 74 : 100;
    header.classList.toggle('is-stuck', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- FAQ: один открытый вопрос ---------- */
  var faqList = document.getElementById('faq-list');
  if (faqList) {
    faqList.addEventListener('toggle', function (e) {
      var opened = e.target;
      if (!opened.open) return;
      faqList.querySelectorAll('details[open]').forEach(function (d) {
        if (d !== opened) d.open = false;
      });
    }, true);
  }

  /* ---------- Слайдер серий ---------- */
  var track = document.getElementById('series-track');
  var arrows = document.querySelectorAll('.series-arrow');
  if (track && arrows.length) {
    function step() {
      var card = track.querySelector('.series-card');
      return card ? card.getBoundingClientRect().width + 12 : 320;
    }
    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 2;
      arrows.forEach(function (btn) {
        var dir = Number(btn.dataset.dir);
        btn.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max;
      });
    }
    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* ---------- Анимация счётчиков ---------- */
  function animateCounter(el) {
    var target = Number(el.dataset.count || '0');
    var suffix = el.dataset.suffix || '';
    if (reducedMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Появление при скролле ---------- */
  var revealTargets = document.querySelectorAll(
    '.section-heading, .category-card, .solution-card, .tool-card, .series-card, .knowledge-card, .stat, .hero-copy, .hero-visual, .hero-step, .request-form, .request-copy > *, .faq-list details, .about-section > *'
  );
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('in-view');
        el.querySelectorAll('[data-count]').forEach(animateCounter);
        if (el.hasAttribute('data-count')) animateCounter(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 8) * 40 + 'ms';
      io.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    document.querySelectorAll('[data-count]').forEach(animateCounter);
  }

  /* ---------- Форма поиска ---------- */
  var searchForm = document.querySelector('.header-search');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = searchForm.querySelector('input').value.trim();
      showToast(q
        ? 'Поиск по запросу «' + q + '» — демо: раздел каталога в разработке'
        : 'Введите артикул, параметр или название для поиска');
    });
  }

  /* ---------- Форма заявки ---------- */
  var requestForm = document.getElementById('request-form');
  if (requestForm) {
    var fileInput = requestForm.querySelector('input[type=file]');
    var fileDrop = document.getElementById('file-drop');
    var fileName = document.getElementById('file-name');
    if (fileInput && fileDrop) {
      fileDrop.addEventListener('click', function () { fileInput.click(); });
      ['dragover', 'dragenter'].forEach(function (evt) {
        fileDrop.addEventListener(evt, function (e) { e.preventDefault(); fileDrop.classList.add('dragover'); });
      });
      ['dragleave', 'drop'].forEach(function (evt) {
        fileDrop.addEventListener(evt, function (e) { e.preventDefault(); fileDrop.classList.remove('dragover'); });
      });
      fileDrop.addEventListener('drop', function (e) {
        if (e.dataTransfer.files.length) showFileName(e.dataTransfer.files[0].name);
      });
      fileInput.addEventListener('change', function () {
        if (fileInput.files.length) showFileName(fileInput.files[0].name);
      });
      function showFileName(name) {
        if (!fileName) return;
        fileName.hidden = false;
        fileName.textContent = 'Прикреплён файл: ' + name;
      }
    }
    requestForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Спасибо! Заявка отправлена — инженер свяжется с вами в течение рабочего дня.');
      requestForm.reset();
      if (fileName) fileName.hidden = true;
    });
  }

  /* ---------- Кнопка консультации ---------- */
  var engineerButton = document.querySelector('.engineer-button');
  if (engineerButton) {
    engineerButton.addEventListener('click', function () {
      var requestSection = document.getElementById('request');
      if (requestSection) requestSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      showToast('Опишите задачу в форме заявки — ответит инженер');
    });
  }
})();
