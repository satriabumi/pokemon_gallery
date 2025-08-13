// About Page JavaScript
class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupAnimations();
    }

    setupContactForm() {
        const form = document.querySelector('.contact-form form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit(e.target);
            });
        }
    }

    handleContactSubmit(form) {
        const formData = new FormData(form);
        const name = formData.get('name') || form.querySelector('input[type="text"]').value;
        const email = formData.get('email') || form.querySelector('input[type="email"]').value;
        const message = formData.get('message') || form.querySelector('textarea').value;

        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Terima kasih! Pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda.');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature, .team-member, .tech-item').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize About page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aboutPage = new AboutPage();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .feature, .team-member, .tech-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }

    .feature.animate-in, .team-member.animate-in, .tech-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .feature:nth-child(1) { transition-delay: 0.1s; }
    .feature:nth-child(2) { transition-delay: 0.2s; }
    .feature:nth-child(3) { transition-delay: 0.3s; }

    .team-member:nth-child(1) { transition-delay: 0.1s; }
    .tech-item:nth-child(1) { transition-delay: 0.1s; }
    .tech-item:nth-child(2) { transition-delay: 0.2s; }
    .tech-item:nth-child(3) { transition-delay: 0.3s; }

    .contact-form form {
        transition: all 0.3s ease;
    }

    .contact-form form:hover {
        transform: translateY(-2px);
    }

    .form-group input:focus,
    .form-group textarea:focus {
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);
