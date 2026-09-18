(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const fr = form.dataset.language === 'fr';
  const copy = fr ? {
    send:'Envoyer', sending:'Envoyer…', required:'Ce champ est requis.', email:'Saisissez une adresse email valide.', invalid:'Vérifiez ce champ.',
    success:'Message envoyé. Nous vous répondrons rapidement.', error:'Une erreur est survenue. Vous pouvez aussi nous écrire à contact@syntheticswarm.ai.'
  } : {
    send:'Send', sending:'Sending…', required:'This field is required.', email:'Enter a valid email address.', invalid:'Please check this field.',
    success:'Message sent. We’ll get back to you soon.', error:'Something went wrong. You can also email us at contact@syntheticswarm.ai.'
  };
  const fields = [...form.querySelectorAll('.contact-field input,.contact-field textarea')];
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-status');
  let pending = false;
  function error(field, text) {
    field.setAttribute('aria-invalid', text ? 'true' : 'false');
    document.getElementById('error-' + field.name).textContent = text;
  }
  fields.forEach(field => field.addEventListener('input', () => error(field, '')));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    status.textContent = '';
    fields.forEach(field => {
      const value = field.value.trim();
      error(field, field.required && !value ? copy.required : field.validity.typeMismatch ? copy.email : !field.validity.valid ? copy.invalid : '');
    });
    const first = fields.find(field => field.getAttribute('aria-invalid') === 'true');
    if (first) { first.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    pending = true; button.disabled = true; button.textContent = copy.sending; form.setAttribute('aria-busy','true');
    try {
      const response = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:AbortSignal.timeout(15000)});
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        if (result.fields) for (const field of fields) if (result.fields[field.name]) error(field, copy.invalid);
        throw new Error('send');
      }
      form.reset(); status.textContent = copy.success;
    } catch { status.textContent = copy.error; }
    finally { pending = false; button.disabled = false; button.textContent = copy.send; form.removeAttribute('aria-busy'); status.focus(); }
  });
})();
