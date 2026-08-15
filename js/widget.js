/**
 * MGE Visitor Counter — self-hosted drop-in replacement for the
 * Elfsight "Visitor Counter" widget.
 *
 * Usage (GitHub Pages / any static page):
 *   <div id="mge-visitor-counter" data-api="https://visitors.mygamingedge.online"></div>
 *   <script src="widget.js"></script>
 *
 * - Renders inside a Shadow DOM, so it can't clash with the page's CSS.
 * - Records one visit per pageview (POST /hit) then fetches /stats
 *   and renders This Month / This Year / Total + a sparkline, same
 *   layout as the original widget.
 */
(function () {
  'use strict';

  function initOne(host) {
    const apiBase = (host.getAttribute('data-api') || '').replace(/\/$/, '');
    if (!apiBase) {
      console.error('[mge-visitor-counter] missing data-api attribute');
      return;
    }

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .card {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 300px;
          aspect-ratio: 3 / 4;
          background: #0a0a0a;
          border-radius: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #e8c34a;
          padding: 16px 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .bg-lines {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          pointer-events: none;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #e8c34a;
          z-index: 1;
        }
        .header svg { flex: 0 0 auto; }
        .label {
          margin-top: 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #cf9f2f;
          z-index: 1;
        }
        .big-number {
          font-size: 34px;
          font-weight: 800;
          line-height: 1.15;
          color: #ffe33d;
          z-index: 1;
        }
        .chart-wrap {
          margin-top: 8px;
          flex: 1 1 auto;
          min-height: 40px;
          z-index: 1;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          z-index: 1;
        }
        .footer .label { margin-top: 0; }
        .footer .value {
          font-size: 20px;
          font-weight: 800;
          color: #ffe33d;
          margin-top: 2px;
        }
        .skeleton { opacity: 0.4; }
      </style>
      <div class="card">
        <svg class="bg-lines" viewBox="0 0 300 400" preserveAspectRatio="none">
          <line x1="0" y1="380" x2="300" y2="0" stroke="#ffffff" stroke-width="1"/>
          <line x1="0" y1="260" x2="300" y2="-60" stroke="#ffffff" stroke-width="1"/>
          <line x1="60" y1="400" x2="300" y2="120" stroke="#ffffff" stroke-width="1"/>
          <line x1="0" y1="120" x2="220" y2="400" stroke="#ffffff" stroke-width="1"/>
          <line x1="140" y1="0" x2="300" y2="260" stroke="#ffffff" stroke-width="1"/>
        </svg>
        <div class="header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="12" width="4" height="9" fill="#e8c34a"/>
            <rect x="10" y="7" width="4" height="14" fill="#e8c34a"/>
            <rect x="17" y="3" width="4" height="18" fill="#e8c34a"/>
          </svg>
          <span>VISITOR COUNTER STATS</span>
        </div>
        <div class="label">THIS MONTH</div>
        <div class="big-number skeleton" data-field="this_month">&nbsp;</div>
        <div class="chart-wrap"><svg class="chart" viewBox="0 0 260 70" preserveAspectRatio="none"></svg></div>
        <div class="footer">
          <div>
            <div class="label">THIS YEAR</div>
            <div class="value skeleton" data-field="this_year">&nbsp;</div>
          </div>
          <div>
            <div class="label">TOTAL</div>
            <div class="value skeleton" data-field="total">&nbsp;</div>
          </div>
        </div>
      </div>
    `;

    const fmt = (n) => Number(n || 0).toLocaleString('en-US');

    function renderChart(daily) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const chart = shadow.querySelector('.chart');
      chart.innerHTML = '';
      if (!daily || daily.length < 2) return;

      const points = daily.slice(-14); // last two weeks, like the original sparkline
      const w = 260;
      const h = 70;
      const pad = 6;
      const max = Math.max(...points.map((p) => p.count), 1);
      const min = Math.min(...points.map((p) => p.count), 0);
      const range = Math.max(max - min, 1);

      const coords = points.map((p, i) => {
        const x = pad + (i * (w - pad * 2)) / (points.length - 1);
        const y = h - pad - ((p.count - min) / range) * (h - pad * 2);
        return [x, y];
      });

      const path = document.createElementNS(svgNS, 'path');
      const d = coords
        .map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(1)},${c[1].toFixed(1)}`)
        .join(' ');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#8b5cf6');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      chart.appendChild(path);

      coords.forEach(([x, y]) => {
        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', x.toFixed(1));
        dot.setAttribute('cy', y.toFixed(1));
        dot.setAttribute('r', '2.5');
        dot.setAttribute('fill', '#8b5cf6');
        chart.appendChild(dot);
      });
    }

    function setField(name, value) {
      const el = shadow.querySelector(`[data-field="${name}"]`);
      if (!el) return;
      el.textContent = fmt(value);
      el.classList.remove('skeleton');
    }

    // Record this pageview once, then load current stats.
    fetch(`${apiBase}/hit`, { method: 'POST' }).catch(() => {});

    fetch(`${apiBase}/stats`)
      .then((r) => r.json())
      .then((data) => {
        setField('this_month', data.this_month);
        setField('this_year', data.this_year);
        setField('total', data.total);
        renderChart(data.daily);
      })
      .catch((err) => console.error('[mge-visitor-counter] stats fetch failed:', err));
  }

  function init() {
    document.querySelectorAll('#mge-visitor-counter, .mge-visitor-counter').forEach(initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
