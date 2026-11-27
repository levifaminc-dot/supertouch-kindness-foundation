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
