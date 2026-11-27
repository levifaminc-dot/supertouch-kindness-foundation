document.addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  alert('This form is unavailable in the preview. Please email info@supertouchkindnessfoundation.org.');
}, true);
