// ===========================
// MOBILE NAV TOGGLE
// ===========================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===========================
// TAB SWITCHER (Register / Sign In)
// ===========================
const tabBtns     = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

function activateTab(tabId) {
  tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  tabContents.forEach(tc  => tc.classList.toggle('active', tc.id === tabId));
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// "Register here" link inside sign-in form
document.querySelectorAll('[data-switch]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    activateTab(el.dataset.switch);
  });
});

// ===========================
// NAVBAR SCROLL SHADOW
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 30 ? '0 4px 24px rgba(26,23,20,0.10)' : 'none';
});

// ===========================
// FORM SUBMISSION (demo)
// ===========================
document.querySelectorAll('.booking-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = '✓ Done!';
    btn.style.background = '#6a8f6a';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
});

// ===========================
// SCROLL REVEAL (lightweight)
// ===========================
const reveals = document.querySelectorAll(
  '.service-card, .testimonial-card, .gallery-item, .intro-image, .booking-form-wrap'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = entry.target.style.transform.replace('translateY(30px)', 'translateY(0)');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = (el.style.transform || '') + ' translateY(30px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  revealObserver.observe(el);
});
