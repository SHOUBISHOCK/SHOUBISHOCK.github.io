/**
 * MGE Poll Widget
 * Usage: <div id="mge-poll" data-slug="first-server"></div>
 *        <script src="poll-widget.js" data-api="https://api.mygamingedge.online"></script>
 */
(function () {
  const scriptTag = document.currentScript;
  const API_BASE = scriptTag.dataset.api || 'https://api.mygamingedge.online';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderResults(container, data, justVoted) {
    container.innerHTML = '';
    const card = el('div', 'mge-poll');
    card.appendChild(el('p', 'mge-poll__question', data.question));

    const total = data.total_votes || 0;
    (data.options || []).forEach(opt => {
      const votes = opt.votes || 0;
      const pct = total > 0 ? Math.round((votes / total) * 100) : 0;

      const btn = el('div', 'mge-poll__option' + (opt.id === data.voted_option_id ? ' mge-poll__option--voted' : ''));
      const fill = el('div', 'mge-poll__option-fill');
      fill.style.width = pct + '%';

      const row = el('div', 'mge-poll__option-row');
      row.appendChild(el('span', 'mge-poll__option-label', opt.label));
      row.appendChild(el('span', 'mge-poll__option-stats', `${votes} · ${pct}%`));

      btn.appendChild(fill);
      btn.appendChild(row);
      card.appendChild(btn);
    });

    card.appendChild(el('div', 'mge-poll__footer', `${total} vote${total === 1 ? '' : 's'}`));
    if (justVoted) {
      card.appendChild(el('div', 'mge-poll__thanks', 'Thanks for voting!'));
    }
    container.appendChild(card);
  }

  function renderVoteForm(container, data) {
    container.innerHTML = '';
    const card = el('div', 'mge-poll');
    card.appendChild(el('p', 'mge-poll__question', data.question));

    const errorBox = el('div', 'mge-poll__error');
    errorBox.style.display = 'none';

    (data.options || []).forEach(opt => {
      const btn = el('button', 'mge-poll__option', opt.label);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        card.querySelectorAll('.mge-poll__option').forEach(b => (b.disabled = true));
        vote(data.slug, opt.id)
          .then(result => renderResults(container, { ...result, question: data.question }, true))
          .catch(err => {
            errorBox.textContent = err.message || 'Something went wrong. Try again.';
            errorBox.style.display = 'block';
            card.querySelectorAll('.mge-poll__option').forEach(b => (b.disabled = false));
          });
      });
      card.appendChild(btn);
    });

    card.appendChild(el('div', 'mge-poll__footer', `${data.total_votes || 0} vote${data.total_votes === 1 ? '' : 's'}`));
    card.appendChild(errorBox);
    container.appendChild(card);
  }

  async function fetchPoll(slug) {
    const res = await fetch(`${API_BASE}/polls/${slug}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Poll not found');
    return res.json();
  }

  async function vote(slug, optionId) {
    const res = await fetch(`${API_BASE}/polls/${slug}/vote`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_id: optionId })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error === 'You have already voted on this poll'
        ? 'You already voted on this poll.'
        : (data.error || 'Vote failed.'));
    }
    return data;
  }

  function mount(container) {
    const slug = container.dataset.slug;
    if (!slug) return;
    container.textContent = 'Loading poll…';
    fetchPoll(slug)
      .then(data => {
        data.slug = slug;
        if (data.already_voted || !data.active) {
          renderResults(container, data, false);
        } else {
          renderVoteForm(container, data);
        }
      })
      .catch(() => {
        container.textContent = '';
      });
  }

  document.querySelectorAll('.mge-poll-embed[data-slug]').forEach(mount);
})();
