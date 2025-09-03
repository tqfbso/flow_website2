/**
 * Principles Page - Interactive Card Functionality
 * Expandable principle cards with smooth animations and accessibility
 */

(function() {
    'use strict';

    // ===== STATE MANAGEMENT =====
    let expandedCards = new Set();
    let isAnimating = false;

    // ===== DOM ELEMENTS =====
    const principleCards = document.querySelectorAll('.principle-card');
    const cardHeaders = document.querySelectorAll('.principle-card__header');

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Debounce function to prevent rapid successive calls
     */
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Get card ID from element
     */
    function getCardId(card) {
        return card.getAttribute('data-principle');
    }

    /**
     * Check if card is currently expanded
     */
    function isCardExpanded(card) {
        return card.classList.contains('expanded');
    }

    /**
     * Get card content height for smooth animations
     */
    function getContentHeight(content) {
        // Temporarily show content to measure its height
        const originalMaxHeight = content.style.maxHeight;
        const originalOpacity = content.style.opacity;
        
        content.style.maxHeight = 'none';
        content.style.opacity = '1';
        content.style.position = 'absolute';
        content.style.visibility = 'hidden';
        
        const height = content.scrollHeight;
        
        // Restore original styles
        content.style.maxHeight = originalMaxHeight;
        content.style.opacity = originalOpacity;
        content.style.position = '';
        content.style.visibility = '';
        
        return height;
    }

    // ===== CARD ANIMATION FUNCTIONS =====
    
    /**
     * Expand a principle card with smooth animation
     */
    function expandCard(card, animate = true) {
        if (isAnimating || isCardExpanded(card)) return;

        const cardId = getCardId(card);
        const content = card.querySelector('.principle-card__content');
        const preview = card.querySelector('.principle-card__preview');
        const toggle = card.querySelector('.principle-card__toggle');

        if (!content || !preview) return;

        isAnimating = true;

        // Update state
        expandedCards.add(cardId);
        card.classList.add('expanded');

        // Update accessibility attributes
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Collapse principle');

        if (animate) {
            // Animate expansion
            const contentHeight = getContentHeight(content);
            
            // Start animation
            content.style.maxHeight = `${contentHeight}px`;
            content.style.opacity = '1';
            
            // Hide preview with fade
            preview.style.opacity = '0';
            preview.style.maxHeight = '0';
            
            // Reset animation lock after transition
            setTimeout(() => {
                isAnimating = false;
                content.style.maxHeight = 'none'; // Allow natural height after animation
            }, 500);
        } else {
            // Immediate expansion (no animation)
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
            preview.style.opacity = '0';
            preview.style.maxHeight = '0';
            isAnimating = false;
        }

        // Announce change to screen readers
        announceToScreenReader(`${card.querySelector('.principle-card__title').textContent} expanded`);
        
        // Track analytics
        trackCardInteraction(cardId, 'expand');
    }

    /**
     * Collapse a principle card with smooth animation
     */
    function collapseCard(card, animate = true) {
        if (isAnimating || !isCardExpanded(card)) return;

        const cardId = getCardId(card);
        const content = card.querySelector('.principle-card__content');
        const preview = card.querySelector('.principle-card__preview');
        const toggle = card.querySelector('.principle-card__toggle');

        if (!content || !preview) return;

        isAnimating = true;

        // Update state
        expandedCards.delete(cardId);
        card.classList.remove('expanded');

        // Update accessibility attributes
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Expand principle');

        if (animate) {
            // Get current height for smooth transition
            const currentHeight = content.scrollHeight;
            content.style.maxHeight = `${currentHeight}px`;
            
            // Force reflow
            content.offsetHeight;
            
            // Animate collapse
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            
            // Show preview with fade
            setTimeout(() => {
                preview.style.opacity = '1';
                preview.style.maxHeight = 'none';
            }, 200);
            
            // Reset animation lock after transition
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        } else {
            // Immediate collapse (no animation)
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            preview.style.opacity = '1';
            preview.style.maxHeight = 'none';
            isAnimating = false;
        }

        // Announce change to screen readers
        announceToScreenReader(`${card.querySelector('.principle-card__title').textContent} collapsed`);
        
        // Track analytics
        trackCardInteraction(cardId, 'collapse');
    }

    /**
     * Toggle card state
     */
    function toggleCard(card, animate = true) {
        if (isCardExpanded(card)) {
            collapseCard(card, animate);
        } else {
            expandCard(card, animate);
        }
    }

    // ===== EVENT HANDLERS =====
    
    /**
     * Handle card header clicks
     */
    function handleCardClick(event) {
        // Prevent event if clicking on the toggle button directly
        if (event.target.closest('.principle-card__toggle')) return;

        const card = event.currentTarget.closest('.principle-card');
        if (!card) return;

        event.preventDefault();
        toggleCard(card);
    }

    /**
     * Handle toggle button clicks
     */
    function handleToggleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const card = event.target.closest('.principle-card');
        if (!card) return;

        toggleCard(card);
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyDown(event) {
        const card = event.target.closest('.principle-card');
        if (!card) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                toggleCard(card);
                break;
                
            case 'Escape':
                if (isCardExpanded(card)) {
                    event.preventDefault();
                    collapseCard(card);
                }
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                focusNextCard(card);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                focusPreviousCard(card);
                break;
        }
    }

    /**
     * Focus next card in sequence
     */
    function focusNextCard(currentCard) {
        const cards = Array.from(principleCards);
        const currentIndex = cards.indexOf(currentCard);
        const nextCard = cards[currentIndex + 1] || cards[0]; // Loop to first if at end
        
        const nextHeader = nextCard.querySelector('.principle-card__header');
        if (nextHeader) {
            nextHeader.focus();
        }
    }

    /**
     * Focus previous card in sequence
     */
    function focusPreviousCard(currentCard) {
        const cards = Array.from(principleCards);
        const currentIndex = cards.indexOf(currentCard);
        const prevCard = cards[currentIndex - 1] || cards[cards.length - 1]; // Loop to last if at beginning
        
        const prevHeader = prevCard.querySelector('.principle-card__header');
        if (prevHeader) {
            prevHeader.focus();
        }
    }

    // ===== ADVANCED FEATURES =====
    
    /**
     * Expand all cards
     */
    function expandAll() {
        if (isAnimating) return;
        
        principleCards.forEach((card, index) => {
            setTimeout(() => {
                if (!isCardExpanded(card)) {
                    expandCard(card, true);
                }
            }, index * 150); // Stagger animations
        });
    }

    /**
     * Collapse all cards
     */
    function collapseAll() {
        if (isAnimating) return;
        
        principleCards.forEach((card, index) => {
            setTimeout(() => {
                if (isCardExpanded(card)) {
                    collapseCard(card, true);
                }
            }, index * 100); // Stagger animations
        });
    }

    /**
     * Auto-expand cards as they come into view (optional)
     */
    function initIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    // Optional: Auto-expand first card when it comes into view
                    // if (getCardId(card) === '1' && !isCardExpanded(card)) {
                    //     setTimeout(() => expandCard(card), 500);
                    // }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-10% 0px -10% 0px'
        });

        principleCards.forEach(card => observer.observe(card));
    }

    /**
     * Save and restore card state in sessionStorage
     */
    function saveCardState() {
        const state = Array.from(expandedCards);
        try {
            sessionStorage.setItem('flowInnovation_expandedPrinciples', JSON.stringify(state));
        } catch (e) {
            console.warn('Could not save card state to sessionStorage');
        }
    }

    function restoreCardState() {
        try {
            const saved = sessionStorage.getItem('flowInnovation_expandedPrinciples');
            if (saved) {
                const state = JSON.parse(saved);
                state.forEach(cardId => {
                    const card = document.querySelector(`[data-principle="${cardId}"]`);
                    if (card) {
                        expandCard(card, false); // Restore without animation
                    }
                });
            }
        } catch (e) {
            console.warn('Could not restore card state from sessionStorage');
        }
    }

    /**
     * Add control buttons for expand/collapse all
     */
    function addControlButtons() {
        const container = document.querySelector('.principles-intro');
        if (!container) return;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'principle-controls';
        controlsDiv.innerHTML = `
            <button type="button" class="principle-control-btn" id="expand-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 12h8M12 8v8"/>
                </svg>
                Expand All
            </button>
            <button type="button" class="principle-control-btn" id="collapse-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 12h8"/>
                </svg>
                Collapse All
            </button>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .principle-controls {
                display: flex;
                gap: var(--spacing-md);
                justify-content: center;
                margin-top: var(--spacing-lg);
            }
            .principle-control-btn {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) var(--spacing-lg);
                font-size: var(--text-sm);
                color: var(--color-blue);
                background: transparent;
                border: 1px solid var(--color-blue);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: var(--transition-fast);
            }
            .principle-control-btn:hover {
                background-color: var(--color-blue);
                color: white;
            }
            @media (max-width: 768px) {
                .principle-controls {
                    flex-direction: column;
                    align-items: center;
                }
                .principle-control-btn {
                    width: 100%;
                    max-width: 200px;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);

        container.appendChild(controlsDiv);

        // Add event listeners
        document.getElementById('expand-all').addEventListener('click', expandAll);
        document.getElementById('collapse-all').addEventListener('click', collapseAll);
    }

    // ===== ANALYTICS & ACCESSIBILITY =====
    
    /**
     * Track card interactions for analytics
     */
    function trackCardInteraction(cardId, action) {
        // In a real implementation, you would send this to your analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'principle_card_interaction', {
                'principle_id': cardId,
                'action': action,
                'event_category': 'engagement'
            });
        }
        
        console.log(`Analytics: Principle ${cardId} ${action}`);
    }

    /**
     * Announce changes to screen readers
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
     * Initialize card accessibility attributes
     */
    function initAccessibility() {
        principleCards.forEach(card => {
            const header = card.querySelector('.principle-card__header');
            const toggle = card.querySelector('.principle-card__toggle');
            const content = card.querySelector('.principle-card__content');
            const cardId = getCardId(card);

            if (header) {
                header.setAttribute('tabindex', '0');
                header.setAttribute('role', 'button');
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('aria-controls', `principle-content-${cardId}`);
            }

            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Expand principle');
            }

            if (content) {
                content.setAttribute('id', `principle-content-${cardId}`);
                content.setAttribute('role', 'region');
                content.setAttribute('aria-labelledby', `principle-header-${cardId}`);
            }

            // Set unique ID for headers
            if (header) {
                header.setAttribute('id', `principle-header-${cardId}`);
            }
        });
    }

    /**
     * Attach event listeners to cards
     */
    function attachEventListeners() {
        // Card header clicks
        cardHeaders.forEach(header => {
            header.addEventListener('click', handleCardClick);
            header.addEventListener('keydown', handleKeyDown);
        });

        // Toggle button clicks
        document.querySelectorAll('.principle-card__toggle').forEach(toggle => {
            toggle.addEventListener('click', handleToggleClick);
        });

        // Save state on page unload
        window.addEventListener('beforeunload', debounce(saveCardState, 100));

        // Handle window resize (recalculate heights if needed)
        window.addEventListener('resize', debounce(() => {
            // Recalculate expanded card heights after resize
            principleCards.forEach(card => {
                if (isCardExpanded(card)) {
                    const content = card.querySelector('.principle-card__content');
                    if (content) {
                        content.style.maxHeight = 'none';
                    }
                }
            });
        }, 250));
    }

    /**
     * Initialize principles page functionality
     */
    function initPrinciplesPage() {
        console.log('🎯 Principles page - Initializing...');

        // Initialize core functionality
        initAccessibility();
        attachEventListeners();
        
        // Initialize advanced features
        initIntersectionObserver();
        addControlButtons();
        
        // Restore previous session state
        restoreCardState();
        
        // Optional: Auto-expand first principle after a delay
        setTimeout(() => {
            const firstCard = document.querySelector('[data-principle="1"]');
            if (firstCard && !isCardExpanded(firstCard)) {
                // expandCard(firstCard, true);
            }
        }, 1000);

        console.log('✅ Principles page - Initialized successfully');
    }

    // ===== AUTO-INITIALIZATION =====
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPrinciplesPage);
    } else {
        initPrinciplesPage();
    }

    // ===== EXPORT FOR DEBUGGING =====
    if (typeof window !== 'undefined') {
        window.PrinciplesPage = {
            expandCard: (cardNumber) => {
                const card = document.querySelector(`[data-principle="${cardNumber}"]`);
                if (card) expandCard(card);
            },
            collapseCard: (cardNumber) => {
                const card = document.querySelector(`[data-principle="${cardNumber}"]`);
                if (card) collapseCard(card);
            },
            expandAll,
            collapseAll,
            getExpandedCards: () => Array.from(expandedCards)
        };
    }

})();