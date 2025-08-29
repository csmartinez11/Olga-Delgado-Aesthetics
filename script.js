document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const overlay = document.querySelector('.overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile menu
  function toggleMenu() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    mainNav.setAttribute('data-visible', !isExpanded);
    overlay.classList.toggle('visible', !isExpanded);
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }

  // Close mobile menu when clicking outside or on a link
  function closeMenu() {
    if (!navToggle || !mainNav) return;
    
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.setAttribute('data-visible', 'false');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // Event Listeners
  if (navToggle && mainNav && overlay) {
    navToggle.addEventListener('click', toggleMenu);
    
    // Close menu when clicking on overlay
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on a nav link on mobile
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Calculate the scroll position, accounting for the fixed header
        const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without adding to history
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          window.location.hash = targetId;
        }
      }
    });
  });

  // Close mobile menu on window resize if it's wider than mobile breakpoint
  function handleResize() {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  }

  // Add active class to current section in navigation
  function setActiveNavLink() {
    const scrollPosition = window.scrollY + 150;
    
    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Run on load and scroll
  window.addEventListener('load', setActiveNavLink);
  window.addEventListener('scroll', setActiveNavLink);
  window.addEventListener('resize', handleResize);
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




