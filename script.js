(async () => {
    const MARKDOWN_FILE = 'boxer_guide.md';
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    const errMsg = document.getElementById('error-msg');
    const navEl = document.getElementById('nav-links');

    // ── Configure marked ──
    marked.setOptions({ breaks: true, gfm: true });

    // ── Fetch markdown ──
    let md = '';
    try {
        const r = await fetch(MARKDOWN_FILE);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        md = await r.text();
    } catch (e) {
        loader.style.display = 'none';
        errMsg.style.display = 'block';
        errMsg.innerHTML = `
        <strong>⚠ Failed to load <code>${MARKDOWN_FILE}</code></strong><br><br>
        Opens <code>index.html</code> via a local server (eg: <code>python3 -m http.server</code> or Live Server in VS Code).<br>
        Browsers block local file requests for security.<br><br>
        <em>Error: ${e.message}</em>
      `;
        return;
    }

    // ── Render ──
    content.innerHTML = marked.parse(md);
    loader.style.display = 'none';

    const headings = content.querySelectorAll('h2');

    let currentGroup = '';
    const groupEls = {};

    // Overview link
    const overviewLink = document.createElement('a');
    overviewLink.onclick = e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const overviewSec = document.createElement('div');
    overviewSec.appendChild(overviewLink);
    navEl.appendChild(overviewSec);

    headings.forEach((h, i) => {
        const id = 'section-' + i;
        h.id = id;
        const text = h.textContent.trim();

        if (group !== currentGroup) {
            currentGroup = group;
            const sec = document.createElement('div');
            sec.className = 'nav-section';
            const title = document.createElement('div');
            title.className = 'nav-section-title';
            title.textContent = group;
            sec.appendChild(title);
            navEl.appendChild(sec);
            groupEls[group] = sec;
        }

        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = `#${id}`;
        link.textContent = text;
        link.onclick = () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        };
        groupEls[group].appendChild(link);
    });

    // Matchups nav entry
    {
        const sec = document.createElement('div');
        sec.className = 'nav-section';
        const title = document.createElement('div');
        title.className = 'nav-section-title';
        sec.appendChild(title);
        const link = document.createElement('a');
        link.onclick = () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        };
        sec.appendChild(link);
        navEl.appendChild(sec);
    }

    // ── Active nav on scroll ──
    const allLinks = document.querySelectorAll('.nav-link[href^="#section-"]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                allLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });

    headings.forEach(h => observer.observe(h));

    // ── Inject hero ──
    const h1 = content.querySelector('h1');
    if (h1) {
        const heroDiv = document.createElement('div');
        heroDiv.id = 'hero';

        const firstImg = content.querySelector('img');
        let imgEl = '';
        if (firstImg) {
            heroDiv.innerHTML = `<img id="hero-img" src="${firstImg.src}" alt="">`;
            firstImg.closest('p')?.remove();
        }

        heroDiv.innerHTML += `
        <div class="hero-content">
          <div class="hero-tag">SSF2X</div>
          <div class="hero-title"><em>BOXER</em></div>
          <div class="hero-sub">Essential Guide</div>
        </div>
      `;
        content.insertBefore(heroDiv, content.firstChild);
        h1.remove();

        if (firstImg) {
            const img = document.createElement('img');
            img.id = 'hero-img';
            img.src = firstImg.src;
            img.alt = '';
            heroDiv.insertBefore(img, heroDiv.firstChild);
        }
    }

    // ── Character select (existing) ──
    const images = document.querySelectorAll('.character-select img');
    const contents = document.querySelectorAll('.content-div');

    images.forEach(img => {
        img.addEventListener('click', () => {
            contents.forEach(div => div.classList.remove('active'));
            images.forEach(i => i.classList.remove('selected'));
            img.classList.add('selected');
            const targetId = img.getAttribute('data-target');
            const targetDiv = document.getElementById(targetId);
            if (targetDiv) targetDiv.classList.add('active');
        });
    });

    // ════════════════════════════════════════════
    // MATCHUPS — load .md files on character click
    // ════════════════════════════════════════════
    const rosterBtns = document.querySelectorAll('.matchup-char-btn');
    const matchupPanel = document.getElementById('matchup-panel');
    const matchupContent = document.getElementById('matchup-content');
    const matchupError = document.getElementById('matchup-error');
    const placeholder = document.getElementById('matchup-placeholder');

    let currentChar = null;

    rosterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const char = btn.dataset.char;
            const file = btn.dataset.file;

            // Toggle off if same char clicked again
            if (currentChar === char) {
                btn.classList.remove('active');
                currentChar = null;
                placeholder.style.display = 'flex';
                matchupContent.classList.remove('visible');
                matchupError.style.display = 'none';
                return;
            }

            // Update active state
            rosterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChar = char;

            // Show loading state
            placeholder.style.display = 'none';
            matchupContent.classList.remove('visible');
            matchupError.style.display = 'none';
            matchupPanel.classList.add('loading');

            try {
                const res = await fetch(file);
                if (!res.ok) throw new Error(`HTTP ${res.status} — fichier introuvable : ${file}`);
                const mdText = await res.text();

                matchupContent.innerHTML = marked.parse(mdText);
                matchupContent.classList.add('visible');

                // ── Init Video.js players inside freshly rendered matchup content ──
                initVideoPlayers(matchupContent);

                // ── Lazy-load images inside freshly rendered matchup content ──
                lazyLoadImages(matchupContent);

            } catch (e) {
                matchupError.innerHTML = `⚠ Impossible de charger <code>${file}</code><br><em>${e.message}</em>`;
                matchupError.style.display = 'block';
            } finally {
                matchupPanel.classList.remove('loading');
            }

            // Scroll panel into view smoothly
            matchupPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
    const vjsPlayers = new Map();   // element → player instance

    function initVideoPlayers(root = document) {
        // Guard: Video.js must be loaded (include its <script> in <head>)
        if (typeof videojs === 'undefined') {
            console.warn('[VideoJS] videojs not found — add the Video.js <script> to your <head>.');
            return;
        }

        root.querySelectorAll('video[data-videojs]').forEach(videoEl => {
            if (vjsPlayers.has(videoEl)) return;  // already initialised

            // Give the element a unique id if it lacks one
            if (!videoEl.id) {
                videoEl.id = 'vjs-' + Math.random().toString(36).slice(2, 9);
            }

            // Build Video.js options from data attributes
            const src = videoEl.dataset.src || videoEl.src || '';
            const type = videoEl.dataset.type || detectMimeType(src);
            const autoplay = videoEl.hasAttribute('data-autoplay');

            const player = videojs(videoEl.id, {
                controls: true,
                preload: 'metadata',
                fluid: true,
                playbackRates: [0.5, 1, 1.5, 2],
                autoplay: autoplay,
                loop: true,
                muted: true,
                html5: {
                    nativeAudioTracks: false,
                    nativeVideoTracks: false,
                    vhs: { overrideNative: true }
                },
                playsinline: true,
                sources: src ? [{ src, type }] : [],
            });

            player.one('loadedmetadata', () => {
                player.currentTime(2);   // ← seek 2sec
            });

            // Swap the GIF/thumbnail for the real video only on first play
            player.one('play', () => {
                if (player.currentSrc() === '') {
                    player.src({ src, type });
                }
            });

            vjsPlayers.set(videoEl, player);
        });
    }

    /** Detect MIME type from file extension */
    function detectMimeType(src) {
        if (!src) return 'video/mp4';
        if (src.includes('youtube.com') || src.includes('youtu.be')) return 'video/youtube';
        if (src.includes('vimeo.com')) return 'video/vimeo';
        const ext = src.split('?')[0].split('.').pop().toLowerCase();
        return { mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', ogg: 'video/ogg' }[ext] || 'video/mp4';
    }

    /** Destroy a player and remove it from the registry (call on teardown) */
    function destroyVideoPlayer(videoEl) {
        const player = vjsPlayers.get(videoEl);
        if (player) { player.dispose(); vjsPlayers.delete(videoEl); }
    }

    // Initialise any players already present in the static page
    initVideoPlayers(document);


    const lazyObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const src = el.dataset.lazySrc;

            if (src) {
                if (el.tagName === 'IMG') {
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        el.src = src;
                        el.classList.add('lazy-loaded');
                    };
                    tempImg.onerror = () => {
                        el.classList.add('lazy-error');
                    };
                    tempImg.src = src;
                } else if (el.tagName === 'VIDEO' || el.tagName === 'IFRAME') {
                    el.src = src;
                    el.classList.add('lazy-loaded');
                }

                delete el.dataset.lazySrc;   // prevent double-loading
            }

            obs.unobserve(el);
        });
    }, {
        rootMargin: '200px 0px',   // start loading 200 px before element enters viewport
        threshold: 0,
    });

    /**
     * Register all lazy-loadable elements inside `root`.
     * @param {Element|Document} root
     */
    function lazyLoadImages(root = document) {
        root.querySelectorAll(
            'img[data-lazy-src], video[data-lazy-src], iframe[data-lazy-src]'
        ).forEach(el => {
            // Give placeholder dimensions so the page doesn't reflow violently
            if (el.tagName === 'IMG' && !el.hasAttribute('width') && !el.hasAttribute('height')) {
                el.style.minHeight = el.style.minHeight || '1px';
            }
            lazyObserver.observe(el);
        });
    }

    // Seed lazy-load for elements already in the DOM
    lazyLoadImages(document);

    // Automatically observe elements added later (e.g. by other scripts)
    const domWatcher = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;          // elements only
                if (node.matches?.('img[data-lazy-src], video[data-lazy-src], iframe[data-lazy-src]')) {
                    lazyObserver.observe(node);
                }
                // Also scan descendants of the added subtree
                node.querySelectorAll?.('img[data-lazy-src], video[data-lazy-src], iframe[data-lazy-src]')
                    .forEach(el => lazyObserver.observe(el));
            });
        });
    });

    domWatcher.observe(document.body, { childList: true, subtree: true });

})();