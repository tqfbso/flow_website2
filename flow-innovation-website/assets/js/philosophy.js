/**
 * Philosophy Page - Specific JavaScript
 * Table of contents, reading progress, and scroll behaviors
 */

(function() {
    'use strict';

    // ===== TABLE OF CONTENTS FUNCTIONALITY =====
    
    const toc = document.getElementById('table-of-contents');
    const tocToggle = document.getElementById('toc-toggle');
    const tocNav = document.getElementById('toc-nav');
    const tocLinks = document.querySelectorAll('.toc__link');
    
    /**
     * Toggle Table of Contents visibility
     */
    function toggleTOC() {
        if (!tocNav) return;
        
        const isCollapsed = tocNav.classList.contains('collapsed');
        
        if (isCollapsed) {
            tocNav.classList.remove('collapsed');
            tocToggle.style.transform = 'rotate(0deg)';
        } else {
            tocNav.classList.add('collapsed');
            tocToggle.style.transform = 'rotate(180deg)';
        }
    }
    
    /**
     * Update active TOC link based on scroll position
     */
    function updateActiveTOCLink() {
        if (!tocLinks.length) return;
        
        const sections = document.querySelectorAll('.article-section');
        const scrollPosition = window.scrollY + 150; // Offset for header
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update active state
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Smooth scroll to section when TOC link is clicked
     */
    function handleTOCLinkClick(event) {
        event.preventDefault();
        
        const targetId = event.target.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // ===== READING PROGRESS INDICATOR =====
    
    /**
     * Create and update reading progress bar
     */
    function createReadingProgressBar() {
        // Create progress bar element
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress__bar"></div>';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 80px;
                left: 0;
                width: 100%;
                height: 3px;
                background-color: rgba(30, 64, 175, 0.1);
                z-index: 999;
                transition: opacity 0.3s ease;
            }
            .reading-progress__bar {
                height: 100%;
                background-color: var(--color-blue);
                width: 0%;
                transition: width 0.1s ease;
            }
            .reading-progress.hidden {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
        
        // Insert after header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', progressBar);
        }
        
        return progressBar;
    }
    
    /**
     * Update reading progress based on scroll position
     */
    function updateReadingProgress() {
        const progressBar = document.querySelector('.reading-progress__bar');
        if (!progressBar) return;
        
        const article = document.querySelector('.philosophy-article');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        // Calculate progress
        const articleStart = articleTop;
        const articleEnd = articleTop + articleHeight - windowHeight;
        
        let progress = 0;
        if (scrollTop >= articleStart) {
            progress = Math.min((scrollTop - articleStart) / (articleEnd - articleStart), 1);
        }
        
        // Update progress bar
        progressBar.style.width = `${progress * 100}%`;
        
        // Hide progress bar if not in article area
        const progressContainer = document.querySelector('.reading-progress');
        if (scrollTop < articleStart - 100) {
            progressContainer.classList.add('hidden');
        } else {
            progressContainer.classList.remove('hidden');
        }
    }
    
    // ===== ARTICLE ENHANCEMENTS =====
    
    /**
     * Add copy-to-clipboard functionality for quotes
     */
    function addQuoteCopyFunctionality() {
        const quotes = document.querySelectorAll('.article-quote, .philosophy-quote-large blockquote');
        
        quotes.forEach(quote => {
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'quote-copy-btn';
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            `;
            copyButton.title = 'Copy quote';
            
            // Style the button
            const buttonStyle = `
                .quote-copy-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid var(--color-border);
                    border-radius: 6px;
                    padding: 8px;
                    color: var(--color-medium-gray);
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s ease;
                }
                .quote-copy-btn:hover {
                    color: var(--color-blue);
                    background: white;
                    box-shadow: var(--shadow-sm);
                }
                .article-quote:hover .quote-copy-btn,
                .philosophy-quote-large:hover .quote-copy-btn {
                    opacity: 1;
                }
                .article-quote,
                .philosophy-quote-large {
                    position: relative;
                }
            `;
            
            if (!document.getElementById('quote-copy-styles')) {
                const style = document.createElement('style');
                style.id = 'quote-copy-styles';
                style.textContent = buttonStyle;
                document.head.appendChild(style);
            }
            
            // Add click handler
            copyButton.addEventListener('click', () => {
                const text = quote.textContent.replace(/^"|"$/g, '').trim();
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        showCopyFeedback(copyButton, 'Copied!');
                    });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showCopyFeedback(copyButton, 'Copied!');
                }
            });
            
            quote.appendChild(copyButton);
        });
    }
    
    /**
     * Show copy feedback
     */
    function showCopyFeedback(button, message) {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<span style="font-size: 12px;">${message}</span>`;
        button.style.opacity = '1';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 1500);
    }
    
    /**
     * Add section highlighting on scroll
     */
    function addSectionHighlighting() {
        const sections = document.querySelectorAll('.article-section');
        
        function highlightCurrentSection() {
            const scrollPosition = window.scrollY + 200;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    section.classList.add('current-section');
                } else {
                    section.classList.remove('current-section');
                }
            });
        }
        
        // Add CSS for section highlighting
        const style = document.createElement('style');
        style.textContent = `
            .article-section {
                transition: all 0.3s ease;
                padding: var(--spacing-lg);
                margin-left: -var(--spacing-lg);
                margin-right: -var(--spacing-lg);
                border-radius: var(--radius-lg);
            }
            .article-section.current-section {
                background-color: rgba(30, 64, 175, 0.02);
            }
        `;
        document.head.appendChild(style);
        
        // Throttled scroll handler
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    highlightCurrentSection();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
        highlightCurrentSection(); // Initial call
    }
    
    /**
     * Add keyboard navigation for sections
     */
    function addKeyboardNavigation() {
        const sections = Array.from(document.querySelectorAll('.article-section'));
        let currentSectionIndex = 0;
        
        document.addEventListener('keydown', (event) => {
            // Only handle if no input is focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(event.key) {
                case 'ArrowDown':
                case 'j': // Vim-style navigation
                    event.preventDefault();
                    if (currentSectionIndex < sections.length - 1) {
                        currentSectionIndex++;
                        scrollToSection(sections[currentSectionIndex]);
                    }
                    break;
                    
                case 'ArrowUp':
                case 'k': // Vim-style navigation
                    event.preventDefault();
                    if (currentSectionIndex > 0) {
                        currentSectionIndex--;
                        scrollToSection(sections[currentSectionIndex]);
                    }
                    break;
                    
                case 'Home':
                    event.preventDefault();
                    currentSectionIndex = 0;
                    scrollToSection(sections[0]);
                    break;
                    
                case 'End':
                    event.preventDefault();
                    currentSectionIndex = sections.length - 1;
                    scrollToSection(sections[sections.length - 1]);
                    break;
            }
        });
        
        function scrollToSection(section) {
            if (!section) return;
            
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Add estimated reading time for each section
     */
    function addSectionReadingTimes() {
        const sections = document.querySelectorAll('.article-section');
        
        sections.forEach(section => {
            const content = section.querySelector('.article-content');
            if (!content) return;
            
            const wordCount = content.textContent.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
            
            const timeIndicator = document.createElement('span');
            timeIndicator.className = 'section-reading-time';
            timeIndicator.textContent = `${readingTime} min read`;
            
            const title = section.querySelector('.article-section__title');
            if (title) {
                title.appendChild(timeIndicator);
            }
        });
        
        // Add styles for reading time indicators
        const style = document.createElement('style');
        style.textContent = `
            .section-reading-time {
                font-size: var(--text-sm);
                font-weight: var(--font-regular);
                color: var(--color-medium-gray);
                margin-left: var(--spacing-md);
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ===== INITIALIZATION =====
    
    /**
     * Initialize philosophy page functionality
     */
    function initPhilosophyPage() {
        console.log('🧘 Philosophy page - Initializing...');
        
        // Table of Contents
        if (tocToggle) {
            tocToggle.addEventListener('click', toggleTOC);
        }
        
        if (tocLinks.length > 0) {
            tocLinks.forEach(link => {
                link.addEventListener('click', handleTOCLinkClick);
            });
        }
        
        // Reading Progress
        createReadingProgressBar();
        
        // Enhanced functionality
        addQuoteCopyFunctionality();
        addSectionHighlighting();
        addKeyboardNavigation();
        addSectionReadingTimes();
        
        // Scroll handlers (throttled)
        let scrollTimer = null;
        function handleScroll() {
            if (scrollTimer) return;
            
            scrollTimer = setTimeout(() => {
                updateActiveTOCLink();
                updateReadingProgress();
                scrollTimer = null;
            }, 16); // ~60fps
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial calls
        updateActiveTOCLink();
        updateReadingProgress();
        
        console.log('✅ Philosophy page - Initialized successfully');
    }
    
    // ===== AUTO-INITIALIZATION =====
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhilosophyPage);
    } else {
        initPhilosophyPage();
    }
    
    // ===== EXPORT FOR DEBUGGING =====
    if (typeof window !== 'undefined') {
        window.PhilosophyPage = {
            updateActiveTOCLink,
            updateReadingProgress,
            toggleTOC
        };
    }

})();