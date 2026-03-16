document.addEventListener('DOMContentLoaded', () => {
    // Determine path depth for relative links
    const path = window.location.pathname.toLowerCase();
    let depth = 0;
    
    // Check for nested directories
    if (path.includes('/tools/') || path.includes('/shared/pages/')) {
        depth = 2;
    }
    
    const rootPath = '../'.repeat(depth) || './';
    const sharedPath = rootPath + 'shared/';

    // ─── Inject Navigation ──────────────────────────────────────────
    if (!document.querySelector('.platform-nav')) {
        const nav = document.createElement('nav');
        nav.className = 'platform-nav';
        nav.innerHTML = `
            <a href="${rootPath}index.html" class="platform-logo">Toolbox<span>.</span></a>
            <div class="nav-actions">
                <button class="lang-btn" id="platform-lang-toggle">EN</button>
            </div>
        `;
        document.body.prepend(nav);
    }

    // ─── Inject Footer ──────────────────────────────────────────────
    if (!document.querySelector('.platform-footer')) {
        const footer = document.createElement('footer');
        footer.className = 'platform-footer';
        footer.innerHTML = `
            <div class="footer-content">
                <p class="copyright">&copy; 2026 Toolbox. All rights reserved.</p>
                <div class="footer-links">
                    <a href="${sharedPath}pages/about.html" data-ko="소개" data-en="About">소개</a>
                    <a href="${sharedPath}pages/contact.html" data-ko="문의" data-en="Contact">문의</a>
                    <a href="${sharedPath}pages/privacy.html" data-ko="개인정보처리방침" data-en="Privacy">개인정보처리방침</a>
                </div>
            </div>
        `;
        document.body.appendChild(footer);
    }

    // ─── Inject SEO Schema ──────────────────────────────────────────
    if (!document.querySelector('#seo-schema')) {
        const script = document.createElement('script');
        script.id = 'seo-schema';
        script.type = 'application/ld+json';
        const pageTitle = document.title;
        const schema = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": pageTitle,
            "url": window.location.href,
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "All",
            "author": {
                "@type": "Person",
                "name": "Park Jae-shin"
            }
        };
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    // ─── Language Logic ─────────────────────────────────────────────
    const langBtn = document.getElementById('platform-lang-toggle') || document.getElementById('lang-toggle');
    let currentLang = document.documentElement.lang || 'ko';

    function updateLanguage(lang) {
        document.querySelectorAll('[data-ko][data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });
        document.documentElement.lang = lang;
        if (langBtn) langBtn.textContent = lang === 'ko' ? 'EN' : 'KO';
    }

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ko' ? 'en' : 'ko';
            updateLanguage(currentLang);
        });
    }
});
