// Setup Guide Interactive Features

document.addEventListener('DOMContentLoaded', () => {
    // Progress tracking
    const totalSteps = 7;
    const progressFill = document.getElementById('progressFill');
    const currentStepEl = document.getElementById('currentStep');
    const successSection = document.getElementById('successSection');
    
    // Track completed steps
    let completedSteps = 0;
    
    // Update progress bar
    function updateProgress() {
        const checkboxes = document.querySelectorAll('.step-check input[type="checkbox"]');
        completedSteps = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        const percentage = (completedSteps / totalSteps) * 100;
        progressFill.style.width = `${percentage}%`;
        currentStepEl.textContent = `Step ${completedSteps + 1}`;
        
        // Show success section if all steps completed
        if (completedSteps === totalSteps) {
            successSection.style.display = 'block';
            successSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            successSection.style.display = 'none';
        }
    }
    
    // Add event listeners to all checkboxes
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
    });
    
    // Copy button functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const textToCopy = this.getAttribute('data-copy');
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '✓ Copied!';
                this.style.background = 'rgba(16, 185, 129, 0.2)';
                this.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                this.style.color = '#10b981';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.background = '';
                    this.style.borderColor = '';
                    this.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                this.innerHTML = '✗ Failed';
                setTimeout(() => {
                    this.innerHTML = '📋 Copy';
                }, 2000);
            }
        });
    });
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
    
    // Smooth scroll to step when clicking step number
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach(card => {
        const stepNumber = card.querySelector('.step-number-badge');
        if (stepNumber) {
            stepNumber.style.cursor = 'pointer';
            stepNumber.addEventListener('click', () => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    });
    
    // Highlight current step based on scroll position
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px'
    };
    
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove highlight from all steps
                stepCards.forEach(card => {
                    card.style.transform = '';
                });
                
                // Highlight current step
                entry.target.style.transform = 'scale(1.02)';
            }
        });
    }, observerOptions);
    
    stepCards.forEach(card => stepObserver.observe(card));
    
    // Animate step cards on scroll
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    stepCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        animateObserver.observe(card);
    });
    
    // Prerequisite check tracking
    const prereqChecks = document.querySelectorAll('.prereq-check input[type="checkbox"]');
    prereqChecks.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.closest('.prereq-card');
            if (this.checked) {
                card.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                card.style.background = 'rgba(16, 185, 129, 0.05)';
            } else {
                card.style.borderColor = '';
                card.style.background = '';
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search (if we add search later)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Future: focus search input
        }
        
        // Escape to close any modals (if we add them)
        if (e.key === 'Escape') {
            // Future: close modals
        }
    });
    
    // Add hover effects to code blocks
    const codeBlocks = document.querySelectorAll('.code-block-wrapper');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.borderColor = 'var(--border-glow)';
            this.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });
    
    // Initialize progress on page load
    updateProgress();
    
    // Add scroll-to-top button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: var(--accent-gradient);
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
    `;
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            scrollButton.style.opacity = '1';
            scrollButton.style.pointerEvents = 'auto';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.pointerEvents = 'none';
        }
    });
    
    scrollButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    scrollButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.6)';
    });
    
    scrollButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.4)';
    });
    
    // Console easter egg
    console.log('%c🚀 DevChronicle Setup Guide', 'font-size: 20px; font-weight: bold; color: #00d4ff;');
    console.log('%cFollow the steps to get started!', 'font-size: 14px; color: #a1a1aa;');
});

// Made with Bob
