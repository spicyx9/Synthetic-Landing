document.querySelectorAll('[data-newsletter-form]').forEach(form => {
  const email = form.elements.email;
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-newsletter-status]');
  const fr = document.documentElement.lang.startsWith('fr');
  const label = button.textContent;
  const copy = fr ? {
    loading:'Inscription…', success:'Inscription confirmée.', error:'Impossible de vous inscrire pour le moment. Réessayez.'
  } : {
    loading:'Subscribing…', success:'You’re subscribed.', error:'Unable to subscribe right now. Please try again.'
  };
  let busy = false;
  email.addEventListener('input', () => { if (!busy) { status.textContent = ''; button.textContent = label; } });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    button.disabled = true;
    button.textContent = copy.loading;
    status.textContent = '';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('/api/newsletter', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({email:email.value, lang:fr ? 'fr' : 'en', company_website:form.elements.company_website.value})
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('subscription failed');
      status.textContent = copy.success;
      button.textContent = copy.success;
    } catch {
      status.textContent = copy.error;
      button.textContent = label;
    } finally {
      clearTimeout(timeout);
      busy = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
});
