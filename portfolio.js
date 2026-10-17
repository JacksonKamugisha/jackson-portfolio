const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('.toast');
const dialog = document.querySelector('.project-dialog');
let toastTimer;

const projectDetails = {
  outage: {
    title: 'Community Outage Tracker',
    description: 'A community-focused concept for sharing timely updates about local service interruptions.',
    detail: '<strong>The idea</strong><br>Neighbors could add a simple report, see recent updates, and understand what is happening nearby at a glance.<br><br><strong>Design focus</strong><br>Make the information clear, location-aware, and useful even for someone checking in quickly.'
  },
  canteen: {
    title: 'Campus Canteen Menu',
    description: 'A lightweight campus menu concept designed around a very everyday question: what is available to eat today?',
    detail: '<strong>The idea</strong><br>Put the day’s menu, meal times, and useful dietary notes in one easy-to-scan place.<br><br><strong>Design focus</strong><br>Keep it friendly, mobile-first, and simple for a canteen team to update.'
  },
  'mobile-money': {
    title: 'Mobile Money Menu',
    description: 'An interface concept exploring how common mobile money actions might feel easier to discover and understand.',
    detail: '<strong>The idea</strong><br>Bring frequent actions such as sending, paying, and reviewing activity into a clear, approachable home screen.<br><br><strong>Design focus</strong><br>Prioritize clarity and confidence for everyday digital finance tasks.'
  }
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isLight = theme === 'light';
  themeIcon.textContent = isLight ? '☾' : '☼';
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
  try { localStorage.setItem('jackson-portfolio-theme', theme); } catch { /* Storage may be unavailable in private browsing. */ }
}

try {
  const savedTheme = localStorage.getItem('jackson-portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') applyTheme(savedTheme);
} catch { /* Use the default dark theme when storage is unavailable. */ }
themeToggle.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  mainNav.classList.toggle('is-open', !expanded);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  mainNav.classList.remove('is-open');
}));

const filterButtons = [...document.querySelectorAll('.filter-chip')];
const projectCards = [...document.querySelectorAll('.project-card')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(chip => {
    const selected = chip === button;
    chip.classList.toggle('selected', selected);
    chip.setAttribute('aria-pressed', String(selected));
  });
  projectCards.forEach(card => {
    card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
  });
}));

document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
  const project = projectDetails[button.dataset.open];
  if (!project) return;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('.dialog-detail').innerHTML = project.detail;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}));

if (dialog) {
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.querySelector('.dialog-done').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => document.querySelector('[data-open]')?.focus());
}

const form = document.querySelector('#message-form');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const note = `Hi Jackson,\n\n${values.get('message')}\n\nBest,\n${values.get('name')}\n${values.get('email')}`;
  const status = document.querySelector('.form-status');
  try {
    await navigator.clipboard.writeText(note);
    status.textContent = 'Your note has been copied. Paste it into your email or messaging app to send.';
    showToast('Note copied to clipboard');
  } catch {
    const temporary = document.createElement('textarea');
    temporary.value = note;
    temporary.setAttribute('readonly', '');
    temporary.style.position = 'fixed';
    temporary.style.opacity = '0';
    document.body.append(temporary);
    temporary.select();
    const copied = document.execCommand('copy');
    temporary.remove();
    status.textContent = copied ? 'Your note has been copied. Paste it into your email or messaging app to send.' : 'Copy was blocked by your browser. Please select and copy your note manually.';
    showToast(copied ? 'Note copied to clipboard' : 'Clipboard access was blocked');
  }
});

document.querySelector('#footer-year').textContent = new Date().getFullYear();

const revealTargets = document.querySelectorAll('.about, .projects-heading, .filter-row, .project-card, .skills, .contact, .message-section');
revealTargets.forEach(element => element.classList.add('reveal'));
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(element => revealObserver.observe(element));

  const sections = document.querySelectorAll('main section[id]');
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => navObserver.observe(section));
} else {
  revealTargets.forEach(element => element.classList.add('visible'));
}
