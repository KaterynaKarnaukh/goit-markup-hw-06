// ================================================
// MODAL
// ================================================

const backdrop = document.querySelector('.backdrop');
const modalDialog = document.querySelector('#modal-dialog');
const modalCloseBtn = document.querySelector('.modal-close-btn');
const orderBtn = document.querySelector('.main-button');
const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

function openModal() {
  backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  orderBtn.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => modalDialog.querySelector(FOCUSABLE)?.focus());
}

function closeModal() {
  backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
  orderBtn.setAttribute('aria-expanded', 'false');
  orderBtn?.focus();
  clearAllErrors(modalForm);
}

orderBtn?.addEventListener('click', openModal);
modalCloseBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

document.addEventListener('keydown', (e) => {
  if (!backdrop?.classList.contains('is-open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const focusable = [...modalDialog.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }
});

// ================================================
// MOBILE MENU
// ================================================

const burgerBtn = document.querySelector('.burger-btm');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileCloseBtn = document.querySelector('.mobile-close-btn');

function openMobileMenu() {
  mobileMenu.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  burgerBtn.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => mobileCloseBtn?.focus());
}

function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  document.body.style.overflow = '';
  burgerBtn.setAttribute('aria-expanded', 'false');
  burgerBtn?.focus();
}

burgerBtn?.addEventListener('click', openMobileMenu);
mobileCloseBtn?.addEventListener('click', closeMobileMenu);

// ================================================
// SMOOTH SCROLL
// ================================================

const NAV_MAP = {
  Studio:    '.main-section',
  Portfolio: '#portfolio',
  Contacts:  '#contacts',
};

function smoothScrollTo(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindNavLinks(selector) {
  document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = NAV_MAP[link.textContent.trim()];
      if (target) { e.preventDefault(); closeMobileMenu(); smoothScrollTo(target); }
    });
  });
}

bindNavLinks('.nav-list .link');
bindNavLinks('.mobile-menu-list .mobile-menu-text');

// ================================================
// ACTIVE NAV — IntersectionObserver
// ================================================

const sectionEntries = Object.entries(NAV_MAP);
const navSections = sectionEntries.map(([, sel]) => document.querySelector(sel)).filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const match = sectionEntries.find(([, sel]) => document.querySelector(sel) === entry.target);
    if (!match) return;
    const [activeName] = match;
    [...document.querySelectorAll('.nav-list .link'), ...document.querySelectorAll('.mobile-menu-list .mobile-menu-text')]
      .forEach((link) => {
        const isActive = link.textContent.trim() === activeName;
        link.classList.toggle('blue', isActive);
        isActive ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
      });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

navSections.forEach((s) => navObserver.observe(s));

// ================================================
// SCROLL ANIMATIONS — IntersectionObserver
// ================================================

const animItems = document.querySelectorAll('.animate-item');

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animItems.forEach((el) => animObserver.observe(el));

// ================================================
// SKELETON LOADER
// ================================================

document.querySelectorAll('.skeleton-card').forEach((card) => {
  const img = card.querySelector('img');
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) {
    card.classList.add('loaded');
  } else {
    img.addEventListener('load', () => card.classList.add('loaded'));
    img.addEventListener('error', () => card.classList.add('loaded'));
  }
});

// ================================================
// SCROLL TO TOP
// ================================================

const scrollTopBtn = document.querySelector('.scroll-top-btn');

if (scrollTopBtn) {
  const toggleScrollBtn = () => {
    const shouldShow = window.scrollY > 400;
    if (shouldShow) {
      scrollTopBtn.removeAttribute('hidden');
      requestAnimationFrame(() => scrollTopBtn.classList.add('is-visible'));
    } else {
      scrollTopBtn.classList.remove('is-visible');
      scrollTopBtn.addEventListener('transitionend', () => {
        if (!scrollTopBtn.classList.contains('is-visible')) scrollTopBtn.setAttribute('hidden', '');
      }, { once: true });
    }
  };

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => { toggleScrollBtn(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ================================================
// FORM VALIDATION
// ================================================

// --- Правила валидации ---
const RULES = {
  'user-name': {
    required: true,
    validate(v) {
      if (!v.trim()) return "Имя обязательно для заполнения";
      if (v.trim().length < 2) return "Имя должно содержать минимум 2 символа";
      if (v.trim().length > 50) return "Имя не должно превышать 50 символов";
      if (!/^[a-zA-Zа-яА-ЯёЁіІїЇєЄ\s''-]+$/.test(v.trim()))
        return "Имя может содержать только буквы, пробелы и дефисы";
      return null;
    }
  },
  'user-phone': {
    required: true,
    validate(v) {
      if (!v.trim()) return "Телефон обязателен для заполнения";
      const digits = v.replace(/[\s\-().+]/g, '');
      if (!/^\d{10,15}$/.test(digits))
        return "Телефон должен содержать минимум 10 цифр, например +38 (050) 123-45-67";
      return null;
    }
  },
  'user-email': {
    required: false,
    validate(v) {
      if (!v.trim()) return null; // необязательное поле
      if (!v.includes('@'))
        return "Email должен содержать символ @";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
        return "Введите корректный email, например name@example.com";
      return null;
    }
  },
  'user-comment': {
    required: false,
    validate(v) {
      if (v.trim().length > 500) return "Комментарий не должен превышать 500 символов";
      return null;
    }
  },
  'user-privacy': {
    required: true,
    validate(v, checked) {
      if (!checked) return "Необходимо принять условия политики конфиденциальности";
      return null;
    }
  },
  // Footer email
  'user-email-footer': {
    required: true,
    validate(v) {
      if (!v.trim()) return "Введите email адрес";
      if (!v.includes('@')) return "Email должен содержать символ @";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
        return "Введите корректный email, например name@example.com";
      return null;
    }
  }
};

// --- DOM утилиты ---

function getOrCreateError(field) {
  // Ищем существующий элемент ошибки рядом с полем
  const wrap = field.closest('.modal-icon, .checkbox-container, .modal-icon-checkbox, .footer-up');
  if (!wrap) return null;

  let errEl = wrap.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    errEl.setAttribute('role', 'alert');
    errEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(errEl);
  }
  return errEl;
}

function showError(field, message) {
  field.classList.add('input-error');
  field.setAttribute('aria-invalid', 'true');
  const errEl = getOrCreateError(field);
  if (errEl) {
    errEl.textContent = message;
    errEl.style.display = 'block';
  }
}

function clearError(field) {
  field.classList.remove('input-error');
  field.removeAttribute('aria-invalid');
  const wrap = field.closest('.modal-icon, .checkbox-container, .modal-icon-checkbox, .footer-up');
  const errEl = wrap?.querySelector('.field-error');
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }
}

function clearAllErrors(form) {
  form?.querySelectorAll('.input-error').forEach(clearError);
}

// --- Валидация одного поля ---

function validateField(field) {
  const rule = RULES[field.name];
  if (!rule) return true;

  const error = field.type === 'checkbox'
    ? rule.validate(field.value, field.checked)
    : rule.validate(field.value);

  if (error) { showError(field, error); return false; }
  clearError(field);
  return true;
}

// --- Навешиваем live-валидацию на поля ---

function bindLiveValidation(form) {
  if (!form) return;

  form.querySelectorAll('input, textarea').forEach((field) => {
    // Показываем ошибку при уходе с поля
    field.addEventListener('blur', () => validateField(field));

    // Убираем ошибку сразу как только пользователь начал исправлять
    field.addEventListener('input', () => {
      if (field.classList.contains('input-error')) validateField(field);
    });

    // Для чекбокса — сразу при change
    if (field.type === 'checkbox') {
      field.addEventListener('change', () => validateField(field));
    }
  });
}

// --- Модальная форма ---

const modalForm = document.querySelector('.modal-form');
bindLiveValidation(modalForm);

modalForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  let isValid = true;
  modalForm.querySelectorAll('input, textarea').forEach((field) => {
    if (!validateField(field)) isValid = false;
  });

  if (!isValid) {
    // Фокус на первое поле с ошибкой
    modalForm.querySelector('.input-error')?.focus();
    return;
  }

  // Успех — закрываем сразу, toast показываем после
  modalForm.reset();
  clearAllErrors(modalForm);
  closeModal();
  showSuccessToast('Спасибо! Мы свяжемся с вами в ближайшее время.');
});

// --- Footer форма ---

const footerForm = document.querySelector('.footer-form');
bindLiveValidation(footerForm);

footerForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const emailInput = footerForm.querySelector('#user-email-footer');
  if (!validateField(emailInput)) {
    emailInput?.focus();
    return;
  }

  showSuccessToast('Вы успешно подписались на рассылку!');
  footerForm.reset();
  clearAllErrors(footerForm);
});

// ================================================
// TOAST — уведомление об успехе
// ================================================

function showSuccessToast(message) {
  let toast = document.querySelector('.success-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2500);
}