/**
 * Header and Navigation Functionality
 * Handles mobile menu toggle, smooth scrolling, and responsive behavior
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const overlay = document.querySelector('.overlay');
    const header = document.querySelector('.header');
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    const html = document.documentElement;
    const body = document.body;
    
    // State
    let isMenuOpen = false;
    
    // Add scroll event for header with throttling
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(function() {
            const scrollPosition = window.scrollY;
            
            if (scrollPosition > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            updateActiveSection();
        });
    }
    
    // Throttled scroll event
    let isScrolling;
    window.addEventListener('scroll', function() {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(handleScroll, 50);
    }, { passive: true });
    
    // Run once on load
    handleScroll();
    
    /**
     * Toggle mobile menu and handle accessibility
     */
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navToggle.setAttribute('aria-label', isExpanded ? 'Open main menu' : 'Close main menu');
        
        // Toggle menu and body classes
        mainNav.classList.toggle('active', !isExpanded);
        body.classList.toggle('menu-open', !isExpanded);
        
        // Prevent background scrolling when menu is open
        if (!isExpanded) {
            body.style.overflow = 'hidden';
            body.style.height = '100vh';
        } else {
            body.style.overflow = '';
            body.style.height = '';
        }
        
        // Toggle overlay with smooth transition
        if (overlay) {
            if (!isExpanded) {
                overlay.style.display = 'block';
                // Force reflow to enable transition
                void overlay.offsetWidth;
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (!mainNav.classList.contains('active')) {
                        overlay.style.display = 'none';
                    }
                }, 300);
            }
        }
        
        // Move focus to first menu item when opening
        if (!isExpanded && navLinks.length > 0) {
            setTimeout(() => {
                navLinks[0].focus();
            }, 100);
        }
    }
    
    // Initialize mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu when clicking on overlay
    if (overlay) {
        overlay.addEventListener('click', toggleMobileMenu);
    }
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            // If it's an anchor link, handle smooth scroll
            if (targetId.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(targetId);
            }
            
            // Close menu if open
            if (isMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMobileMenu();
        }
    });
    
    // Handle window resize with debounce
    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 992 && isMenuOpen) {
                toggleMobileMenu();
            }
        }, 250);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Handle skip link
    if (skipLink && mainContent) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            setTimeout(() => {
                mainContent.removeAttribute('tabindex');
            }, 1000);
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's a # link
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Calculate the header offset
                const headerOffset = header ? header.offsetHeight + 20 : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without adding to history
                history.pushState(null, null, targetId);
            }
        });
    });
    
    /**
     * Update active section in navigation based on scroll position
     */
    function updateActiveSection() {
        if (!navLinks.length) return;
        
        // Get all sections that have an ID referenced in the navigation
        const sections = Array.from(navLinks)
            .map(link => link.getAttribute('href'))
            .filter(href => href && href !== '#')
            .map(href => document.querySelector(href))
            .filter(Boolean);
        
        if (!sections.length) return;
        
        // Find the section that's currently in view
        const scrollPosition = window.scrollY + (header ? header.offsetHeight : 100);
        
        for (const section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop - 200 && 
                scrollPosition < sectionTop + sectionHeight - 100) {
                const currentId = `#${section.id}`;
                
                // Update active state in navigation
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === currentId;
                    link.classList.toggle('active', isActive);
                    link.setAttribute('aria-current', isActive ? 'page' : null);
                });
                
                break;
            }
        }
    }
    
    /**
     * Smooth scroll to target element
     */
    function smoothScrollTo(targetId, event = null) {
        if (event) event.preventDefault();
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        const headerOffset = header ? header.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Smooth scroll to target
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Update URL without adding to history
        if (history.pushState) {
            history.pushState(null, null, targetId);
        } else {
            location.hash = targetId;
        }
    }
    
    // Initialize scroll-based active section highlighting
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    
    // Update active section on page load
    updateActiveSection();
});
