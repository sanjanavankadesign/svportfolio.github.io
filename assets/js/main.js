// Main JavaScript for Sanjana Vanka Portfolio

// Helper: Calculate exact smooth scroll target with dynamic sticky header and contents bar offset
function smoothScrollToElement(targetEl, extraOffset = 16) {
    if (!targetEl) return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 80;

    // Detect if there is a secondary sticky bar (e.g. Floating Contents Bar on Case Study pages)
    let secondaryStickyHeight = 0;
    const secondarySticky = document.querySelector('.sticky:not(header), div.sticky');
    if (secondarySticky && window.getComputedStyle(secondarySticky).position === 'sticky') {
        secondaryStickyHeight = secondarySticky.offsetHeight + 10;
    }

    const totalOffset = headerHeight + secondaryStickyHeight + extraOffset;
    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - totalOffset;

    window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark Mode Toggle Handler with Visual Icon Update
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    function safeStorageGet(key) {
        try { return localStorage.getItem(key); } catch(e) { return null; }
    }
    function safeStorageSet(key, val) {
        try { localStorage.setItem(key, val); } catch(e) {}
    }

    function applyTheme(isDark) {
        if (isDark) {
            htmlEl.classList.add('dark');
            safeStorageSet('theme', 'dark');
        } else {
            htmlEl.classList.remove('dark');
            safeStorageSet('theme', 'light');
        }
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = isDark
                ? `<span class="material-symbols-outlined w-5 h-5 text-stickyyellow">light_mode</span>`
                : `<span class="material-symbols-outlined w-5 h-5 text-slate-800">dark_mode</span>`;
            themeToggleBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }

    // Check system preference or localStorage
    const savedTheme = safeStorageGet('theme');
    let systemPrefersDark = false;
    try {
        systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch(e) {}
    const isInitiallyDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    applyTheme(isInitiallyDark);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const willBeDark = !htmlEl.classList.contains('dark');
            applyTheme(willBeDark);
        });
    }

    // 2. Mobile Navigation Menu Handler (with toggle state, icon morph, and auto-close)
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    function closeMobileMenu() {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.innerHTML = `<span class="material-symbols-outlined w-5 h-5">menu</span>`;
            }
        }
    }

    function openMobileMenu() {
        if (mobileMenu && mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.innerHTML = `<span class="material-symbols-outlined w-5 h-5">close</span>`;
            }
        }
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (mobileMenu.classList.contains('hidden')) {
                openMobileMenu();
            } else {
                closeMobileMenu();
            }
        });

        // Close when clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        });
    }

    // 3. Homepage Logo Click: Smooth Scroll to Top
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('case-studies');
    if (isHomePage) {
        const logoLinks = document.querySelectorAll('header a[href="index.html"], header a[href="./index.html"], header a[href="/"], header a.group[aria-label*="Home"]');
        logoLinks.forEach(logo => {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                if (window.location.hash) {
                    history.pushState(null, null, window.location.pathname + window.location.search);
                }
                updateActiveNavState();
                closeMobileMenu();
            });
        });
    }

    // 4. Smooth In-Page Anchor Links (Desktop + Mobile + Sticky Bar + Buttons)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href*="#"]');
        if (!link) return;

        // Skip resume PDF links
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === '#!' || href.includes('.pdf')) return;

        // Determine if target element exists on the CURRENT page
        let targetId = '';
        if (href.startsWith('#')) {
            targetId = href.slice(1);
        } else {
            try {
                const targetUrl = new URL(link.href, window.location.href);
                const currentUrl = new URL(window.location.href);
                // Compare pathnames normalizing for index.html / trailing slashes
                const normalizePath = p => p.replace(/\/index\.html$/, '/').replace(/\/$/, '');
                if (normalizePath(targetUrl.pathname).toLowerCase() === normalizePath(currentUrl.pathname).toLowerCase() && targetUrl.hash) {
                    targetId = targetUrl.hash.slice(1);
                }
            } catch (err) {
                // Ignore parsing errors
            }
        }

        if (targetId) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                closeMobileMenu();
                smoothScrollToElement(targetEl);
                history.pushState(null, null, `#${targetId}`);
                setTimeout(updateActiveNavState, 150);
            }
        }
    });

    // 5. Scrollspy Active Highlighting (Desktop & Mobile Nav + Case Study Contents Bar)
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');
    const contentsLinks = document.querySelectorAll('.contents-nav a, div.sticky a[href^="#"]');

    function updateActiveNavState() {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        const scrollPos = window.pageYOffset + headerHeight + 60;
        const isBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 70);

        // A. Primary Navigation Bar Highlighting
        const workSec = document.getElementById('work');
        const aboutSec = document.getElementById('about');
        const contactSec = document.getElementById('contact');

        if (workSec || aboutSec || contactSec) {
            let activeId = '';

            if (isBottom && contactSec) {
                activeId = 'contact';
            } else if (contactSec && scrollPos >= (contactSec.getBoundingClientRect().top + window.pageYOffset - 120)) {
                activeId = 'contact';
            } else if (aboutSec && scrollPos >= (aboutSec.getBoundingClientRect().top + window.pageYOffset)) {
                activeId = 'about';
            } else if (workSec && scrollPos >= (workSec.getBoundingClientRect().top + window.pageYOffset)) {
                activeId = 'work';
            }

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                const matches = href === `#${activeId}` || href.endsWith(`#${activeId}`);
                if (activeId && matches) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // B. Case Study Floating Contents Bar Highlighting
        if (contentsLinks.length > 0) {
            let activeContentsId = '';
            contentsLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                const sec = document.getElementById(href.slice(1));
                if (sec) {
                    const top = sec.getBoundingClientRect().top + window.pageYOffset;
                    if (scrollPos >= top - 60) {
                        activeContentsId = sec.getAttribute('id');
                    }
                }
            });

            contentsLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (activeContentsId && href === `#${activeContentsId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNavState, { passive: true });
    window.addEventListener('resize', updateActiveNavState, { passive: true });
    updateActiveNavState();

    // 6. Cross-Page Landing via Hash (e.g. from Case Study "BACK TO WORK" or "ABOUT")
    function handleInitialHash() {
        if (!window.location.hash) return;
        const targetId = window.location.hash.slice(1);
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        // Perform multi-stage adjustment as DOM fonts/images load
        [60, 200, 500, 900].forEach(delay => {
            setTimeout(() => {
                smoothScrollToElement(targetEl);
                updateActiveNavState();
            }, delay);
        });
    }

    handleInitialHash();
    window.addEventListener('load', handleInitialHash);

    // 7. Image Lightbox Handler with Interactive Pan & Zoom
    createLightbox();

    // 8. Ensure Resume Links Open Directly in New Tab (Option A)
    initResumeLinks();

    // 7. Digital Scrapbook Flatlay Parallax Movement
    const flatlayHero = document.querySelector('section.bg-black');
    if (flatlayHero) {
        flatlayHero.addEventListener('mousemove', (e) => {
            const rect = flatlayHero.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
            const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

            flatlayHero.querySelectorAll('.flatlay-object').forEach((obj, idx) => {
                const depth = (idx % 4 + 1) * 14;
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;
                obj.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
            });
        });

        flatlayHero.addEventListener('mouseleave', () => {
            flatlayHero.querySelectorAll('.flatlay-object').forEach((obj) => {
                obj.style.transform = `translate3d(0px, 0px, 0px)`;
            });
        });
    }
});

// Lightbox interactive state variables
let lightboxScale = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function createLightbox() {
    if (!document.getElementById('lightbox-modal')) {
        const modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.className = 'lightbox-modal';
        modal.style.display = 'none'; // Absolutely prevent hit testing when inactive
        modal.innerHTML = `
            <!-- Controls Bar -->
            <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-50 pointer-events-auto">
                <div class="flex items-center gap-2 bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-lg text-xs font-mono">
                    <span class="hidden sm:inline">Scroll to Zoom · Drag to Pan</span>
                    <span id="zoom-level-indicator" class="text-stickypink font-bold">100%</span>
                </div>
                
                <div class="flex items-center gap-2">
                    <button id="zoom-in-btn" title="Zoom In (+)" class="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-stickypink hover:text-slate-950 transition-all border border-slate-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                    <button id="zoom-out-btn" title="Zoom Out (-)" class="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-stickypink hover:text-slate-950 transition-all border border-slate-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                    </button>
                    <button id="zoom-reset-btn" title="Reset Zoom" class="px-3 py-2 rounded-xl bg-slate-900/90 text-white hover:bg-stickypink hover:text-slate-950 transition-all border border-slate-700 text-xs font-bold font-mono">
                        1:1
                    </button>
                    <button id="lightbox-close" aria-label="Close image preview" class="p-2.5 rounded-xl bg-stickypink text-slate-950 hover:bg-white transition-all border border-slate-900 shadow-md">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Image Viewport Wrapper -->
            <div id="lightbox-viewport" class="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none">
                <img id="lightbox-img" class="lightbox-img transition-transform duration-75 origin-center pointer-events-auto" src="" alt="Enlarged design artifact">
            </div>
        `;
        document.body.appendChild(modal);

        const modalImg = document.getElementById('lightbox-img');
        const viewport = document.getElementById('lightbox-viewport');

        // Close logic
        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === viewport) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });

        // Zoom & Pan Event Listeners
        document.getElementById('zoom-in-btn').addEventListener('click', (e) => { e.stopPropagation(); updateZoom(0.3); });
        document.getElementById('zoom-out-btn').addEventListener('click', (e) => { e.stopPropagation(); updateZoom(-0.3); });
        document.getElementById('zoom-reset-btn').addEventListener('click', (e) => { e.stopPropagation(); resetZoomPan(); });

        // Wheel Zoom
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            updateZoom(delta);
        }, { passive: false });

        // Drag to Pan
        viewport.addEventListener('mousedown', (e) => {
            if (e.target === modalImg || e.target === viewport) {
                isDragging = true;
                startX = e.clientX - lightboxPanX;
                startY = e.clientY - lightboxPanY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                lightboxPanX = e.clientX - startX;
                lightboxPanY = e.clientY - startY;
                applyTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Double click to toggle zoom
        modalImg.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (lightboxScale > 1) {
                resetZoomPan();
            } else {
                lightboxScale = 2.5;
                applyTransform();
            }
        });
    }

    // Helper: Detect if an image is protected under NDA
    function isNdaScreen(img) {
        if (!img) return false;
        if (img.classList.contains('nda-protected-screen') || img.getAttribute('data-nda') === 'true') return true;
        const src = (img.getAttribute('src') || '').toLowerCase();
        if (src.includes('connect-mockup') || src.includes('connect-laptop') || src.includes('what-is-connect') || src.includes('iterations')) return true;
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        if (alt.includes('connect 2.0') || alt.includes('connect mockup') || alt.includes('connect platform') || alt.includes('nda')) return true;
        return false;
    }

    // Attach click listener to artifact images
    document.querySelectorAll('.artifact-frame img, img.zoomable').forEach(img => {
        if (isNdaScreen(img)) {
            img.classList.remove('zoomable', 'cursor-zoom-in');
            img.classList.add('nda-protected-screen', 'cursor-pointer');
            img.setAttribute('data-nda', 'true');
            // Strictly prevent lightbox zoom; open NDA confidentiality dialog instead
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openNdaNoticeModal();
            });
            return;
        }

        img.addEventListener('click', () => {
            const modal = document.getElementById('lightbox-modal');
            const modalImg = document.getElementById('lightbox-img');
            if (modal && modalImg) {
                // Secondary fail-safe check
                if (isNdaScreen(img)) {
                    openNdaNoticeModal();
                    return;
                }
                modalImg.src = img.src;
                modalImg.alt = img.alt || 'Enlarged design artifact';
                modalImg.style.filter = '';
                resetZoomPan();
                modal.style.display = 'flex';
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                });
            }
        });
    });
}


function updateZoom(amount) {
    lightboxScale = Math.min(Math.max(0.75, lightboxScale + amount), 5);
    applyTransform();
}

function resetZoomPan() {
    lightboxScale = 1;
    lightboxPanX = 0;
    lightboxPanY = 0;
    applyTransform();
}

function applyTransform() {
    const modalImg = document.getElementById('lightbox-img');
    const indicator = document.getElementById('zoom-level-indicator');
    if (modalImg) {
        modalImg.style.transform = `translate(${lightboxPanX}px, ${lightboxPanY}px) scale(${lightboxScale})`;
    }
    if (indicator) {
        indicator.textContent = `${Math.round(lightboxScale * 100)}%`;
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        resetZoomPan();
    }
}

// 4. Copy Email to Clipboard Function
function copyEmailToClipboard(buttonEl, emailStr = 'sanju101vanka@gmail.com') {
    navigator.clipboard.writeText(emailStr).then(() => {
        const textSpan = buttonEl.querySelector('.copy-text');
        const originalText = textSpan ? textSpan.textContent : 'COPY EMAIL';
        if (textSpan) textSpan.textContent = 'COPIED TO CLIPBOARD! ✓';
        
        buttonEl.classList.add('bg-emerald-400', 'text-slate-950', 'border-emerald-400');
        
        setTimeout(() => {
            if (textSpan) textSpan.textContent = originalText;
            buttonEl.classList.remove('bg-emerald-400', 'text-slate-950', 'border-emerald-400');
        }, 2200);
    }).catch(err => {
        console.error('Failed to copy email:', err);
    });
}

// 5. Ensure Resume Links Open Cleanly in New Tab (Option A)
function initResumeLinks() {
    document.querySelectorAll('a[href*="Resume.pdf"], a[href*="resume.pdf"]').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.removeAttribute('download');
    });
}

// 6. Password Protected Figma Modal Handler
let targetFigmaUrl = '';

function openFigmaModal(figmaUrl) {
    targetFigmaUrl = figmaUrl || 'https://www.figma.com';
    
    // Check if already authenticated in this session
    try {
        if (sessionStorage.getItem('figma_unlocked') === 'true') {
            const win = window.open(targetFigmaUrl, '_blank', 'noopener,noreferrer');
            if (!win) {
                window.location.href = targetFigmaUrl;
            }
            return false;
        }
    } catch(e) {}

    let modal = document.getElementById('figma-password-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'figma-password-modal';
        modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-brutal-lg dark:shadow-brutal-dark rounded-3xl p-6 sm:p-8 max-w-md w-full relative space-y-5 text-slate-900 dark:text-white">
                <button type="button" onclick="closeFigmaModal()" class="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Close modal">&times;</button>
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-2 border-slate-900 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined w-6 h-6">lock</span>
                    </div>
                    <div>
                        <h3 class="font-serif text-2xl font-bold">Figma Access Required</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Enter passcode to access Figma design files</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <label class="block text-xs font-display font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Enter Passcode</label>
                    <input type="password" id="figma-passcode-input" placeholder="Enter password..." class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stickypink" onkeydown="if(event.key==='Enter'){ event.preventDefault(); verifyFigmaPassword(); }">
                    <div id="figma-error-msg" class="text-xs font-bold text-red-500 hidden">Incorrect passcode. Please contact Sanjana for access.</div>
                </div>
                <div class="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onclick="closeFigmaModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-display font-bold text-xs border border-slate-900">CANCEL</button>
                    <button type="button" onclick="verifyFigmaPassword()" class="px-6 py-2.5 rounded-xl bg-stickypink text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-brutal hover:bg-fuchsia transition-all">UNLOCK FIGMA ↗</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFigmaModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeFigmaModal();
        });
    }

    const input = document.getElementById('figma-passcode-input');
    const errorEl = document.getElementById('figma-error-msg');
    if (input) input.value = '';
    if (errorEl) errorEl.classList.add('hidden');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    setTimeout(() => { if (input) input.focus(); }, 100);
    return false;
}

function closeFigmaModal() {
    const modal = document.getElementById('figma-password-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

function verifyFigmaPassword() {
    const input = document.getElementById('figma-passcode-input');
    const errorEl = document.getElementById('figma-error-msg');
    const code = input ? input.value.trim() : '';

    const validPasswords = ['sanjana2026', 'connect2026', 'figma2026', 'sanjana'];

    if (validPasswords.includes(code.toLowerCase())) {
        try { sessionStorage.setItem('figma_unlocked', 'true'); } catch(e) {}
        closeFigmaModal();
        const win = window.open(targetFigmaUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
            window.location.href = targetFigmaUrl;
        }
    } else {
        if (errorEl) errorEl.classList.remove('hidden');
        if (input) input.focus();
    }
}

// 7. NDA Protection Notice Modal Handler
function openNdaNoticeModal() {
    let modal = document.getElementById('nda-notice-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'nda-notice-modal';
        modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-brutal-lg dark:shadow-brutal-dark rounded-3xl p-6 sm:p-8 max-w-lg w-full relative space-y-5 text-slate-900 dark:text-white transform transition-transform">
                <button type="button" onclick="closeNdaNoticeModal()" class="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Close modal">&times;</button>
                
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border-2 border-slate-900 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                </div>

                <div class="p-4 rounded-2xl bg-cream dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Unblurred views are protected under client NDA. Access complete designs in the password-protected Figma file.
                    </p>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onclick="closeNdaNoticeModal()" class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-display font-bold text-xs border border-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">CLOSE</button>
                    <a href="https://www.figma.com/design/T7I5vpt26rNd0vCbcY2sAY/Connect--Freelance-Recruiter-?node-id=332-2" onclick="closeNdaNoticeModal(); return openFigmaModal(this.href);" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stickypink text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-brutal hover:bg-stickyyellow transition-all">
                        <span>UNLOCK FIGMA</span>
                        <span class="material-symbols-outlined text-sm">lock</span>
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeNdaNoticeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNdaNoticeModal();
        });
    }

    modal.style.display = 'flex';
    return false;
}

function closeNdaNoticeModal() {
    const modal = document.getElementById('nda-notice-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 8. Case Study Card Click Handler
function handleCaseStudyCardClick(event, url) {
    if (!url) return;
    // Don't trigger card navigation if an interactive child element was clicked
    if (event.target.closest('a, button, input, textarea, select')) {
        return;
    }
    // Don't navigate if user is selecting/highlighting text on the card
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        return;
    }
    if (event.metaKey || event.ctrlKey) {
        window.open(url, '_blank');
    } else {
        window.location.href = url;
    }
}

// ==========================================================================
// Google Material Design Icons Global Helper & Backward Compatibility
// ==========================================================================
window.lucide = {
    createIcons: function() {
        const LUCIDE_TO_MATERIAL = {
            'arrow-up-right': 'north_east', 'arrow-right': 'arrow_forward', 'arrow-left': 'arrow_back',
            'arrow-down': 'arrow_downward', 'lock': 'lock', 'sparkles': 'auto_awesome',
            'moon': 'dark_mode', 'sun': 'light_mode', 'menu': 'menu', 'x': 'close',
            'plus': 'add', 'message-square': 'chat_bubble', 'send': 'send', 'copy': 'content_copy',
            'users': 'group', 'check': 'check', 'alert-triangle': 'warning', 'chevron-left': 'chevron_left',
            'chevron-right': 'chevron_right', 'file-text': 'description', 'help-circle': 'help',
            'search': 'search', 'calendar': 'calendar_today', 'edit-3': 'edit', 'phone-call': 'call',
            'mail-open': 'mark_email_read', 'user-check': 'how_to_reg', 'ghost': 'sentiment_dissatisfied',
            'shield-alert': 'gpp_maybe', 'git-branch': 'fork_right', 'pie-chart': 'pie_chart',
            'heart': 'favorite', 'compass': 'explore', 'check-circle-2': 'check_circle',
            'network': 'hub', 'book-open': 'menu_book', 'image': 'image', 'layout': 'dashboard',
            'layout-grid': 'grid_view', 'bar-chart-2': 'bar_chart', 'settings': 'settings',
            'briefcase': 'work', 'target': 'track_changes', 'clock': 'schedule',
            'paperclip': 'attach_file', 'mic': 'mic', 'map-pin': 'location_on', 'bot': 'smart_toy',
            'filter': 'filter_alt'
        };
        document.querySelectorAll('[data-lucide]').forEach(el => {
            const iconName = el.getAttribute('data-lucide');
            const matName = LUCIDE_TO_MATERIAL[iconName] || iconName.replace(/-/g, '_');
            const span = document.createElement('span');
            span.className = 'material-symbols-outlined ' + (el.className || '');
            span.textContent = matName;
            el.replaceWith(span);
        });
    }
};




