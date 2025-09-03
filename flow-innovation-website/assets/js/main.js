/**
 * Flow Innovation - Main JavaScript
 * Zen-minimalist interactions and functionality
 */

(function() {
    'use strict';

    // ===== DOM ELEMENTS =====
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Throttle function to limit execution frequency
     */
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * Debounce function to delay execution
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top <= windowHeight * (1 + threshold) &&
            rect.bottom >= windowHeight * -threshold &&
            rect.left <= windowWidth * (1 + threshold) &&
            rect.right >= windowWidth * -threshold
        );
    }

    // ===== NAVIGATION FUNCTIONALITY =====
    
    /**
     * Handle header scroll effects
     */
    function handleHeaderScroll() {
        if (window.scrollY >= 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    /**
     * Show mobile navigation
     */
    function showNav() {
        navMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstLink = navMenu.querySelector('.nav__link');
        if (firstLink) firstLink.focus();
    }

    /**
     * Hide mobile navigation
     */
    function hideNav() {
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to toggle button
        if (navToggle) navToggle.focus();
    }

    /**
     * Handle navigation link clicks
     */
    function handleNavLinkClick(event) {
        const link = event.target;
        const href = link.getAttribute('href');
        
        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
            hideNav();
        }
        
        // Handle smooth scrolling for anchor links
        if (href && href.startsWith('#')) {
            event.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                updateActiveNavLink(href);
            }
        }
    }

    /**
     * Update active navigation link
     */
    function updateActiveNavLink(activeHref) {
        navLinks.forEach(link => {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === activeHref) {
                link.classList.add('nav__link--active');
            }
        });
    }

    /**
     * Handle scroll spy for navigation
     */
    function handleScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + header.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                updateActiveNavLink(`#${sectionId}`);
            }
        });
    }

    // ===== ANIMATION FUNCTIONALITY =====
    
    /**
     * Handle scroll animations
     */
    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        animatedElements.forEach(element => {
            if (isInViewport(element, 0.1) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                
                const animationType = element.getAttribute('data-animate');
                const delay = element.getAttribute('data-delay') || '0';
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, parseInt(delay));
            }
        });
    }

    /**
     * Initialize scroll animations
     */
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.section, .preview-card, .pathway-card, .stat-card');
        
        elements.forEach((element, index) => {
            element.setAttribute('data-animate', 'fadeInUp');
            element.setAttribute('data-delay', (index * 100).toString());
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });
    }

    // ===== MODAL FUNCTIONALITY =====
    
    /**
     * Modal manager
     */
    const Modal = {
        current: null,
        
        open(modalId) {
            const modal = document.getElementById(`${modalId}-modal`);
            if (!modal) return;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.current = modal;
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            // Handle escape key
            document.addEventListener('keydown', this.handleEscape);
        },
        
        close(modal = null) {
            const targetModal = modal || this.current;
            if (!targetModal) return;
            
            targetModal.classList.remove('active');
            document.body.style.overflow = '';
            this.current = null;
            
            document.removeEventListener('keydown', this.handleEscape);
        },
        
        handleEscape(event) {
            if (event.key === 'Escape') {
                Modal.close();
            }
        }
    };

    /**
     * Handle modal triggers
     */
    function handleModalTriggers() {
        // Modal open buttons
        document.addEventListener('click', function(event) {
            const trigger = event.target.closest('[data-modal]');
            if (trigger) {
                event.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                Modal.open(modalId);
            }
        });

        // Modal close buttons
        document.addEventListener('click', function(event) {
            if (event.target.closest('[data-close-modal]')) {
                Modal.close();
            }
            
            // Close on backdrop click
            if (event.target.classList.contains('modal')) {
                Modal.close();
            }
        });
    }

    // ===== FORM FUNCTIONALITY =====
    
    /**
     * Form validation
     */
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const type = input.type;
            
            // Remove existing error states
            input.classList.remove('error');
            
            // Check if empty
            if (!value) {
                input.classList.add('error');
                isValid = false;
                return;
            }
            
            // Email validation
            if (type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    input.classList.add('error');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    /**
     * Handle form submissions
     */
    function handleFormSubmissions() {
        document.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            if (!validateForm(form)) {
                // Show error message
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Disable submit button
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Show success message
                showNotification('Thank you! Your request has been submitted.', 'success');
                
                // Close modal if form is in modal
                const modal = form.closest('.modal');
                if (modal) {
                    Modal.close(modal);
                }
                
                // Reset form
                form.reset();
                
                // In a real implementation, you would send the data to your server here
                console.log('Form data:', new FormData(form));
                
            }, 2000);
        });
    }

    // ===== NOTIFICATION SYSTEM =====
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 3000;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease-out;
                }
                .notification--success { border-left: 4px solid #10b981; }
                .notification--error { border-left: 4px solid #ef4444; }
                .notification--info { border-left: 4px solid #3b82f6; }
                .notification.show { transform: translateX(0); }
                .notification__content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    gap: 12px;
                }
                .notification__message {
                    font-size: 14px;
                    color: #374151;
                }
                .notification__close {
                    color: #6b7280;
                    cursor: pointer;
                    transition: color 0.15s ease;
                }
                .notification__close:hover {
                    color: #374151;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===== PERFORMANCE OPTIMIZATIONS =====
    
    /**
     * Lazy load images
     */
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    /**
     * Preload critical resources
     */
    function preloadCriticalResources() {
        const criticalImages = [
            // Add paths to critical images here
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    /**
     * Handle keyboard navigation
     */
    function initKeyboardNavigation() {
        // Trap focus in modal
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Tab' && Modal.current) {
                const focusableElements = Modal.current.querySelectorAll(
                    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        });

        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: fixed;
            top: -40px;
            left: 6px;
            background: #000;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Announce dynamic content changes to screen readers
     */
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ===== INITIALIZATION =====
    
    /**
     * Initialize all functionality when DOM is ready
     */
    function init() {
        console.log('🌊 Flow Innovation - Initializing...');
        
        // Navigation
        if (navToggle) navToggle.addEventListener('click', showNav);
        if (navClose) navClose.addEventListener('click', hideNav);
        navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
        
        // Scroll effects with throttling
        const throttledScrollHandler = throttle(() => {
            handleHeaderScroll();
            handleScrollSpy();
            handleScrollAnimations();
        }, 16); // ~60fps
        
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        
        // Resize handler
        const throttledResizeHandler = throttle(() => {
            // Handle any resize-specific logic here
            console.log('Window resized');
        }, 250);
        
        window.addEventListener('resize', throttledResizeHandler, { passive: true });
        
        // Initialize features
        initScrollAnimations();
        handleModalTriggers();
        handleFormSubmissions();
        initLazyLoading();
        initKeyboardNavigation();
        preloadCriticalResources();
        
        // Initial calls
        handleHeaderScroll();
        handleScrollSpy();
        handleScrollAnimations();
        
        console.log('✅ Flow Innovation - Initialized successfully');
    }

    // ===== DOM READY =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ===== GLOBAL ERROR HANDLING =====
    window.addEventListener('error', function(event) {
        console.error('JavaScript error:', event.error);
        // In production, you might want to send this to an error tracking service
    });

    // ===== EXPORT FOR DEBUGGING =====
    if (typeof window !== 'undefined') {
        window.FlowInnovation = {
            Modal,
            showNotification,
            announceToScreenReader
        };
    }

})();