for (const button of document.querySelectorAll('[data-copy-value]')) {
  button.addEventListener('click', async () => {
    const status = button.closest('section').querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(button.dataset.copyValue);
      status.textContent = button.dataset.copyLabel + ' copied.';
    } catch {
      status.textContent = 'Copy is unavailable. You can select and copy the details above.';
    }
  });
}

for (const menu of document.querySelectorAll('.skf-site-header details')) {
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
}

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const format = new Intl.NumberFormat('en-GB');
  const counterObserver = new IntersectionObserver((entries) => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      counterObserver.unobserve(target);
      const finalValue = Number(target.dataset.impactCount);
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 850, 1);
        const current = Math.round(finalValue * (1 - (1 - progress) ** 3));
        target.textContent = format.format(current);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }, {threshold: 0.6});
  for (const counter of document.querySelectorAll('[data-impact-count]')) counterObserver.observe(counter);
}
