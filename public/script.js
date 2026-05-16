// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe all tool demos for animation
document.addEventListener('DOMContentLoaded', () => {
    const toolDemos = document.querySelectorAll('.tool-demo');
    toolDemos.forEach((demo, index) => {
        demo.classList.add('animate-on-scroll');
        demo.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(demo);
    });

    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.classList.add('animate-on-scroll');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe setup steps
    const setupSteps = document.querySelectorAll('.setup-step');
    setupSteps.forEach((step, index) => {
        step.classList.add('animate-on-scroll');
        step.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(step);
    });
});

// Add active state to navigation on scroll
let lastScrollTop = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow to nav on scroll
    if (scrollTop > 50) {
        nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    lastScrollTop = scrollTop;
});

// Animate code blocks on visibility
const animateCodeBlocks = () => {
    const codeBlocks = document.querySelectorAll('.code-block');
    
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const inputBlock = entry.target.querySelector('.input-block');
                const outputBlock = entry.target.querySelector('.output-block');
                const arrow = entry.target.querySelector('.arrow');
                
                // Reset animations
                inputBlock.style.animation = 'none';
                outputBlock.style.animation = 'none';
                arrow.style.animation = 'none';
                
                // Trigger reflow
                void inputBlock.offsetWidth;
                void outputBlock.offsetWidth;
                void arrow.offsetWidth;
                
                // Restart animations
                inputBlock.style.animation = 'slideInLeft 0.6s ease-out';
                outputBlock.style.animation = 'slideInRight 0.6s ease-out 0.3s backwards';
                arrow.style.animation = 'pulse 2s ease-in-out infinite 0.6s';
            }
        });
    }, { threshold: 0.5 });
    
    codeBlocks.forEach(block => codeObserver.observe(block));
};

// Initialize code block animations
document.addEventListener('DOMContentLoaded', animateCodeBlocks);

// Add typing effect to hero title (optional enhancement)
const addTypingEffect = () => {
    const gradientText = document.querySelector('.gradient-text');
    if (!gradientText) return;
    
    const text = gradientText.textContent;
    gradientText.textContent = '';
    gradientText.style.opacity = '1';
    
    let index = 0;
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            gradientText.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, 100);
};

// Parallax effect for stars
window.addEventListener('scroll', () => {
    const stars = document.querySelector('.stars');
    if (stars) {
        const scrolled = window.pageYOffset;
        stars.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effect to tool demos
document.querySelectorAll('.tool-demo').forEach(demo => {
    demo.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    demo.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Copy code snippet functionality
const addCopyButtons = () => {
    const codeSnippets = document.querySelectorAll('.code-snippet');
    
    codeSnippets.forEach(snippet => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋 Copy';
        copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 0.25rem;
            color: var(--accent-primary);
            cursor: pointer;
            font-size: 0.75rem;
            transition: all 0.3s;
        `;
        
        snippet.style.position = 'relative';
        snippet.appendChild(copyButton);
        
        copyButton.addEventListener('click', () => {
            const code = snippet.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = '✓ Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = '📋 Copy';
                }, 2000);
            });
        });
        
        copyButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(99, 102, 241, 0.2)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(99, 102, 241, 0.1)';
        });
    });
};

// Initialize copy buttons
document.addEventListener('DOMContentLoaded', addCopyButtons);

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Console easter egg
console.log('%c🚀 DevChronicle MCP Server', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cInterested in the code? Check out our GitHub!', 'font-size: 14px; color: #a1a1aa;');
console.log('%chttps://github.com/yourusername/devchronicle', 'font-size: 12px; color: #8b5cf6;');

// Made with Bob
