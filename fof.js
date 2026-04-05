/**
 * fof-frontier.js
 * Fistful of Frags — Frontier Territory
 * Standalone script · Wild West Landing Page
 */

'use strict';

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    initEmberCanvas();
    initDustParticles();
    initClickSmoke();
    initScrollReveal();
    initPosterParallax();
    initVideoKeepAlive();

    console.log(
        '%c🤠 FISTFUL OF FRAGS — Frontier Territory',
        'color:#fbbf24;font-size:16px;font-weight:bold;text-shadow:1px 1px 0 #000'
    );
    console.log('%cDraw, pardner.', 'color:#92400e;font-style:italic');
});

/* ═══════════════════════════════════════════════
   EMBER PARTICLE CANVAS
═══════════════════════════════════════════════ */
let emberCount = 40;
const embers   = [];

function initEmberCanvas() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createEmber() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - .5) * .8,
            vy: -(Math.random() * 1.2 + .4),
            life: 1,
            decay: Math.random() * .004 + .002,
            size: Math.random() * 2.5 + .5,
            hue: Math.random() * 30 + 20,   // orange→yellow range
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * .04 + .01,
        };
    }

    // Seed initial embers spread across their lifecycle
    for (let i = 0; i < emberCount; i++) {
        const e = createEmber();
        e.y    = Math.random() * canvas.height;
        e.life = Math.random();
        embers.push(e);
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Maintain target count
        while (embers.length < emberCount) embers.push(createEmber());

        for (let i = embers.length - 1; i >= 0; i--) {
            const e = embers[i];
            e.life -= e.decay;

            if (e.life <= 0) {
                embers.splice(i, 1);
                continue;
            }

            e.wobble += e.wobbleSpeed;
            e.x      += e.vx + Math.sin(e.wobble) * .3;
            e.y      += e.vy;

            const alpha = e.life * (e.life < .3 ? e.life / .3 : 1);
            const r = e.size * (0.5 + e.life * 0.5);

            // Glow halo
            const grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 3.5);
            grd.addColorStop(0,   `hsla(${e.hue}, 100%, 80%, ${alpha * .9})`);
            grd.addColorStop(0.4, `hsla(${e.hue},  90%, 55%, ${alpha * .4})`);
            grd.addColorStop(1,   `hsla(${e.hue},  80%, 40%, 0)`);

            ctx.beginPath();
            ctx.arc(e.x, e.y, r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${e.hue + 20}, 100%, 90%, ${alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(tick);
    }
    tick();
}

/* ═══════════════════════════════════════════════
   CSS DUST PARTICLES
═══════════════════════════════════════════════ */
function initDustParticles() {
    const field = document.getElementById('dustField');
    if (!field) return;

    for (let i = 0; i < 22; i++) spawnDust(field);
}

function spawnDust(field) {
    const el = document.createElement('div');
    el.className = 'dust-particle';

    const size    = Math.random() * 5 + 2;
    const x       = Math.random() * 100;
    const dur     = Math.random() * 18 + 12;
    const delay   = Math.random() * -20;
    const dx      = (Math.random() - .5) * 200;
    const ds      = Math.random() * .5 + .7;

    el.style.cssText = `
        bottom: ${Math.random() * 20}%;
        left: ${x}vw;
        width:  ${size}px;
        height: ${size}px;
        --dx: ${dx}px;
        --ds: ${ds};
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
        opacity: 0;
    `;

    el.addEventListener('animationend', () => {
        el.remove();
        spawnDust(field);
    });

    field.appendChild(el);
}

/* ═══════════════════════════════════════════════
   VIDEO KEEP-ALIVE
   Handles browsers pausing background videos
═══════════════════════════════════════════════ */
function initVideoKeepAlive() {
    const video = document.getElementById('bgVideo');
    if (!video) return;

    // Force muted (some browsers reset this)
    video.muted  = true;
    video.volume = 0;

    // Try to play immediately
    const tryPlay = () => {
        video.play().catch(() => {
            // If blocked, retry once user interacts
            document.addEventListener('click',  () => video.play(), { once: true });
            document.addEventListener('keydown', () => video.play(), { once: true });
        });
    };

    // Play as soon as enough data is loaded
    video.addEventListener('canplay', tryPlay, { once: true });

    // If it stalls or pauses unexpectedly, resume it
    video.addEventListener('stalled', () => { video.load(); tryPlay(); });
    video.addEventListener('pause',   () => { if (!video.ended) tryPlay(); });
    video.addEventListener('ended',   () => { video.currentTime = 0; tryPlay(); });

    // Resume when tab comes back into focus
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tryPlay();
    });

    tryPlay();
}

/* ═══════════════════════════════════════════════
   GUN SMOKE ON BUTTON CLICK
═══════════════════════════════════════════════ */
function initClickSmoke() {
    document.addEventListener('click', (e) => {
        const btn = e.target.tagName === 'BUTTON' || e.target.tagName === 'A'
                 || e.target.closest('button') || e.target.closest('a');
        if (!btn) return;

        for (let i = 0; i < 3; i++) spawnSmoke(e.clientX, e.clientY, i);
    });
}

function spawnSmoke(x, y, idx) {
    const el  = document.createElement('div');
    el.className = 'gun-smoke';

    const size  = 16 + idx * 8;
    const offX  = (Math.random() - .5) * 30;
    const offY  = (Math.random() - .5) * 20;

    el.style.cssText = `
        left: ${x + offX - size / 2}px;
        top:  ${y + offY - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        animation-delay: ${idx * 60}ms;
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
}

/* ═══════════════════════════════════════════════
   INTERSECTION OBSERVER — SCROLL REVEAL
═══════════════════════════════════════════════ */
function initScrollReveal() {
    const cards = document.querySelectorAll('.feat-card, .server-card');
    if (!cards.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = e.target.dataset.delay || 0;
                e.target.style.animationDelay = delay + 'ms';
                e.target.style.animationPlayState = 'running';
                io.unobserve(e.target);
            }
        });
    }, { threshold: .12 });

    cards.forEach(c => {
        c.style.animationPlayState = 'paused';
        io.observe(c);
    });
}

/* ═══════════════════════════════════════════════
   SUBTLE PARALLAX ON POSTER (mouse)
═══════════════════════════════════════════════ */
function initPosterParallax() {
    const poster = document.getElementById('posterWrap');
    if (!poster || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', (e) => {
        cx = (e.clientX / window.innerWidth  - .5) * 12;
        cy = (e.clientY / window.innerHeight - .5) *  8;
    });

    function frame() {
        tx += (cx - tx) * .06;
        ty += (cy - ty) * .06;
        poster.style.transform = `rotate(${0.8 + tx * .05}deg) translate(${tx * .6}px, ${ty * .6}px)`;
        requestAnimationFrame(frame);
    }
    frame();
}
