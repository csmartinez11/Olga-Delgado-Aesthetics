// Mobile nav toggle
const toggleBtn = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');
if (toggleBtn && nav) {
  toggleBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  // Close menu on nav click (mobile)
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll for internal links (non-SSR safe)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    }
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Booking form validation + mailto fallback
const form = document.getElementById('booking-form');
const statusEl = document.querySelector('.form-status');

function setError(field, message) {
  const small = field.closest('.form-field, .form-checkbox')?.querySelector('.error');
  if (small) small.textContent = message || '';
}

function validateForm(fd) {
  let ok = true;

  // Required fields
  ['name', 'email', 'service', 'duration', 'date', 'time'].forEach(name => {
    const field = form.elements[name];
    if (!field || !field.value.trim()) {
      ok = false; setError(field, 'Required');
    } else setError(field, '');
  });

  // Email format
  const email = fd.get('email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ok = false; setError(form.elements['email'], 'Enter a valid email');
  }

  // Consent checkbox
  const consent = form.elements['consent'];
  if (!consent.checked) {
    ok = false; setError(consent, 'Please agree to continue');
  } else setError(consent, '');

  return ok;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  statusEl.textContent = ''; // clear

  const fd = new FormData(form);
  if (!validateForm(fd)) {
    statusEl.textContent = 'Please fix the errors above.';
    return;
  }

  // Build a mailto fallback (opens user’s email client)
  const subject = encodeURIComponent(`Booking Request — ${fd.get('name')}`);
  const body = encodeURIComponent(
    [
      `Name: ${fd.get('name')}`,
      `Email: ${fd.get('email')}`,
      `Phone: ${fd.get('phone') || '—'}`,
      `Service: ${fd.get('service')}`,
      `Duration: ${fd.get('duration')}`,
      `Date: ${fd.get('date')}`,
      `Time: ${fd.get('time')}`,
      `Notes: ${fd.get('notes') || '—'}`
    ].join('\n')
  );
  // TODO: replace with your real booking email
  const to = 'hello@haven-aesthetics.com';
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

  statusEl.textContent = 'Thanks! Your email app should open now. We’ll confirm shortly.';
});




