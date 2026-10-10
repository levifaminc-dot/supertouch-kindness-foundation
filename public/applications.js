(() => {
  const form = document.getElementById('application-form');
  if (!form) return;
  let submissionKey = crypto.randomUUID();
  const role = form.elements.namedItem('role');
  document.querySelectorAll('[data-apply-role]').forEach(link => link.addEventListener('click', () => { role.value = link.dataset.applyRole; }));
  const queryRole = new URL(location.href).searchParams.get('role');
  if ([...role.options].some(o => o.value === queryRole)) role.value = queryRole;
  const button = document.getElementById('application-submit');
  const error = document.getElementById('application-error');
  const cv = form.elements.namedItem('cv');
  cv.addEventListener('change', () => { cv.setCustomValidity(''); const file = cv.files[0]; if (file && (!file.name.toLowerCase().endsWith('.pdf') || file.size > 2 * 1024 * 1024)) cv.setCustomValidity('Choose a PDF file no larger than 2 MB.'); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    error.hidden = true;
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    form.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
    const cover = form.elements.namedItem('coverLetter').files[0]; if (cover && (cover.size > 2 * 1024 * 1024 || !cover.name.toLowerCase().endsWith('.pdf'))) { error.textContent = 'Choose a cover letter PDF no larger than 2 MB.'; error.hidden = false; return; } const payload = new FormData(form); payload.set('submissionKey', submissionKey);
    button.disabled = true; button.textContent = 'Submitting application…'; form.setAttribute('aria-busy','true');
    try {
      const response = await fetch('/api/applications', { method: 'POST', body: payload, headers: {Accept:'application/json'} });
      const data = await response.json();
      if (!response.ok || !data.reference) {
        for (const [name, message] of Object.entries(data.fields || {})) { const fieldError = document.getElementById('error-' + name); if (fieldError) fieldError.textContent = message; const input = form.elements.namedItem(name); if (input?.setAttribute) input.setAttribute('aria-invalid','true'); }
        throw new Error(data.error || 'Your application was not saved. Please try again.');
      }
      document.getElementById('application-reference').textContent = data.reference;
      document.getElementById('application-success-role').textContent = payload.get('role') + ' · Unpaid · Maiduguri';
      form.hidden = true;
      const success = document.getElementById('application-success'); success.hidden = false; success.focus();
      form.reset(); submissionKey = crypto.randomUUID();
    } catch (e) {
      error.textContent = e instanceof TypeError ? 'Connection interrupted. Your form is still here. Please try again; a retry will not create a duplicate application.' : (e.message || 'Unable to submit. Please try again.');
      error.hidden = false; error.focus();
    } finally { button.disabled = false; button.textContent = 'Submit application ↗'; form.removeAttribute('aria-busy'); }
  });
})();
