const header = document.querySelector('.site-header');
const navShell = document.querySelector('.nav-shell');

function updateStickyHeader() {
  navShell.classList.toggle('is-scrolled', window.scrollY > 16);
}

window.addEventListener('scroll', updateStickyHeader, { passive: true });
updateStickyHeader();

const heroSlider = document.querySelector('.hero-media');

if (heroSlider && !heroSlider.dataset.sliderInitialized) {
  heroSlider.dataset.sliderInitialized = 'true';
  const slides = [...heroSlider.querySelectorAll('.hero-slide')];
  const captionTitle = heroSlider.querySelector('.hero-media-caption strong');
  const captionDescription = heroSlider.querySelector('.hero-media-caption span');
  let activeSlide = slides.findIndex((slide) => slide.classList.contains('is-active'));
  let transitionTimeout;

  function showSlide(index, direction = 1) {
    const previousSlide = slides[activeSlide];
    activeSlide = (index + slides.length) % slides.length;
    const nextSlide = slides[activeSlide];

    window.clearTimeout(transitionTimeout);
    slides.forEach((slide) => {
      slide.classList.remove('is-active', 'is-entering-from-right', 'is-entering-from-left', 'is-leaving-to-left', 'is-leaving-to-right');
    });
    previousSlide.classList.add(direction > 0 ? 'is-leaving-to-left' : 'is-leaving-to-right');
    nextSlide.classList.add('is-active', direction > 0 ? 'is-entering-from-right' : 'is-entering-from-left');
    captionTitle.textContent = slides[activeSlide].dataset.title;
    captionDescription.textContent = slides[activeSlide].dataset.description;

    transitionTimeout = window.setTimeout(() => {
      previousSlide.classList.remove('is-leaving-to-left', 'is-leaving-to-right');
      nextSlide.classList.remove('is-entering-from-right', 'is-entering-from-left');
    }, 200);
  }

  heroSlider.querySelectorAll('[data-slide-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.slideDirection === 'next' ? 1 : -1;
      showSlide(activeSlide + direction);
    });
  });

  const autoplayInterval = 4000;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => showSlide(activeSlide + 1, 1), autoplayInterval);
  }
}

const catalogToggle = document.querySelector('.catalog-toggle');
const catalogPanel = document.querySelector('#catalog-panel');
const menuToggle = document.querySelector('.menu-toggle');
const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
const mainNav = document.querySelector('.main-nav');
const navSearchToggle = document.querySelector('.nav-search-toggle');
const navSearchInput = document.querySelector('.nav-search input');
const navReturnToggle = document.querySelector('.nav-return-toggle');

function positionCatalogPanel() {
  const gap = Number.parseFloat(getComputedStyle(catalogPanel).getPropertyValue('--catalog-gap')) || 0;
  const top = navShell.getBoundingClientRect().bottom + gap;
  catalogPanel.style.setProperty('--catalog-panel-top', `${Math.ceil(top)}px`);
}

function setCatalog(open) {
  if (open) positionCatalogPanel();
  catalogPanel.hidden = !open;
  navShell.classList.toggle('is-catalog-open', open);
  catalogToggle.setAttribute('aria-expanded', String(open));
  catalogToggle.setAttribute('aria-label', open ? 'Закрыть каталог' : 'Открыть каталог');
  catalogToggle.querySelector('.catalog-icon').hidden = open;
  catalogToggle.querySelector('.catalog-close-icon').hidden = !open;
  catalogToggle.querySelector('.catalog-label').textContent = open ? 'Закрыть' : 'Каталог';
}

window.addEventListener('scroll', () => {
  if (!catalogPanel.hidden) positionCatalogPanel();
}, { passive: true });

window.addEventListener('resize', () => {
  if (!catalogPanel.hidden) positionCatalogPanel();
});

function setMenu(open) {
  header.classList.toggle('nav-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

function setSearch(open) {
  if (open) mainNav.style.width = `${mainNav.offsetWidth}px`;
  header.classList.toggle('search-open', open);
  navSearchToggle.setAttribute('aria-expanded', String(open));
  mobileSearchToggle.setAttribute('aria-expanded', String(open));
  navSearchInput.tabIndex = open ? 0 : -1;
}

catalogToggle.addEventListener('click', () => {
  const open = catalogPanel.hidden;
  setCatalog(open);
  if (open) {
    setMenu(false);
    setSearch(false);
  }
});

menuToggle.addEventListener('click', () => {
  const open = !header.classList.contains('nav-open');
  setMenu(open);
  if (open) {
    setCatalog(false);
    setSearch(false);
  }
});

navSearchToggle.addEventListener('click', () => {
  setCatalog(false);
  setSearch(true);
  navSearchInput.focus();
});

mobileSearchToggle.addEventListener('click', () => {
  setCatalog(false);
  setMenu(true);
  setSearch(true);
  navSearchInput.focus();
});

navReturnToggle.addEventListener('click', () => {
  setSearch(false);
  navSearchToggle.focus();
});

catalogPanel.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setCatalog(false));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('click', (event) => {
  if (!catalogPanel.hidden && !header.contains(event.target)) setCatalog(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (header.classList.contains('search-open')) {
    setSearch(false);
    navSearchToggle.focus();
  }
  if (!catalogPanel.hidden) {
    setCatalog(false);
    catalogToggle.focus();
  }
  if (header.classList.contains('nav-open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

window.addEventListener('resize', () => {
  setSearch(false);
  mainNav.style.width = '';
  if (window.innerWidth > 1100) setMenu(false);
});

const requestForm = document.querySelector('#request-form');

if (requestForm) {
  const uploadZone = document.querySelector('#upload-zone');
  const fileInput = document.querySelector('#spec-file');
  const fileName = document.querySelector('#file-name');
  const uploadTitle = document.querySelector('#upload-title');
  const feedback = document.querySelector('#form-feedback');

  function showFile(file) {
    if (!file) return;
    if (!/\.(xls|xlsx|pdf)$/i.test(file.name)) {
      fileInput.value = '';
      uploadTitle.textContent = 'Перетащите файл или выберите на компьютере';
      fileName.textContent = 'Нужен файл .xls, .xlsx или .pdf';
      return;
    }
    uploadTitle.textContent = file.name;
    fileName.textContent = `${(file.size / 1024 / 1024).toFixed(2)} МБ · файл выбран`;
  }

  fileInput.addEventListener('change', () => showFile(fileInput.files[0]));

  ['dragenter', 'dragover'].forEach((type) => {
    uploadZone.addEventListener(type, (event) => {
      event.preventDefault();
      uploadZone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach((type) => {
    uploadZone.addEventListener(type, (event) => {
      event.preventDefault();
      uploadZone.classList.remove('is-dragging');
    });
  });

  uploadZone.addEventListener('drop', (event) => {
    fileInput.files = event.dataTransfer.files;
    showFile(fileInput.files[0]);
  });

  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!requestForm.checkValidity()) {
      requestForm.reportValidity();
      return;
    }
    feedback.textContent = 'Демо: заявка заполнена. Данные не отправляются — для этого нужен серверный обработчик.';
    feedback.classList.add('is-visible');
  });
}
