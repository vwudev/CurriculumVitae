(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       1. Terminal typing effect
    --------------------------------------------------------- */
    const typedEl = document.getElementById('typedText');
    const roles = [
        'Junior Web Developer.',
        'Frontend Developer (HTML · CSS · JS).',
        'PHP MVC & ASP.NET MVC enthusiast.',
        'Future Full-Stack Developer.'
    ];

    function typeLoop() {
        if (!typedEl) return;
        if (prefersReducedMotion) {
            typedEl.textContent = roles[0];
            return;
        }
        let roleIndex = 0, charIndex = 0, deleting = false;

        const tick = () => {
            const current = roles[roleIndex];

            if (!deleting) {
                charIndex++;
                typedEl.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(tick, 1600);
                    return;
                }
            } else {
                charIndex--;
                typedEl.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(tick, deleting ? 35 : 65);
        };
        tick();
    }
    typeLoop();

    /* ---------------------------------------------------------
       2. Theme toggle (persisted)
    --------------------------------------------------------- */
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const statusTheme = document.getElementById('statusTheme');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'light'
                ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        }
        if (statusTheme) statusTheme.textContent = theme === 'light' ? 'Light' : 'Dark';
        localStorage.setItem('cv-theme', theme);
    }

    const savedTheme = localStorage.getItem('cv-theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(savedTheme);

    themeToggle && themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
    });

    /* ---------------------------------------------------------
       3. Tab navigation + scroll spy + status bar file label
    --------------------------------------------------------- */
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const panes = tabs.map(t => document.getElementById(t.dataset.target)).filter(Boolean);
    const statusFile = document.getElementById('statusFile');
    const fileNames = { hero: 'profile.js', objective: 'objective.md', projects: 'projects.json' };

    function setActiveTab(id) {
        tabs.forEach(t => {
            const isActive = t.dataset.target === id;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', String(isActive));
        });
        if (statusFile && fileNames[id]) statusFile.textContent = fileNames[id];
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.getElementById(tab.dataset.target);
            if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    });

    if ('IntersectionObserver' in window && panes.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveTab(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        panes.forEach(p => spy.observe(p));
    }

    /* ---------------------------------------------------------
       4. Scroll-reveal animation
    --------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    /* ---------------------------------------------------------
       5. Project filter chips
    --------------------------------------------------------- */
    const chips = Array.from(document.querySelectorAll('.chip'));
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const emptyState = document.getElementById('emptyState');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filter = chip.dataset.filter;
            let visibleCount = 0;

            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.tags.includes(filter);
                card.classList.toggle('is-hidden', !match);
                if (match) visibleCount++;
            });

            if (emptyState) emptyState.hidden = visibleCount !== 0;
        });
    });

    /* ---------------------------------------------------------
       6. Copy email to clipboard (feedback via status bar)
    --------------------------------------------------------- */
    const copyBtn = document.getElementById('copyEmailBtn');

    copyBtn && copyBtn.addEventListener('click', async () => {
        const email = 'vwusadboy@gmail.com';
        try {
            await navigator.clipboard.writeText(email);
        } catch (err) {
            const helper = document.createElement('textarea');
            helper.value = email;
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            document.body.removeChild(helper);
        }
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';

        const original = statusFile ? statusFile.textContent : '';
        if (statusFile) statusFile.textContent = '✓ Đã sao chép email';

        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>';
            if (statusFile) statusFile.textContent = original;
        }, 1800);
    });

    /* ---------------------------------------------------------
       7. Print / export PDF
    --------------------------------------------------------- */
    const printBtn = document.getElementById('printBtn');
    printBtn && printBtn.addEventListener('click', () => window.print());

    /* ---------------------------------------------------------
       8. Scroll progress bar + back-to-top button
    --------------------------------------------------------- */
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + '%';
        if (backToTop) {
            backToTop.hidden = false;
            backToTop.classList.toggle('visible', scrollTop > 400);
        }
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop && backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

})();
