(function () {
  const range = document.querySelector('[data-pricing-range]');
  if (!range) return;
  const isFr = document.documentElement.lang === 'fr';
  const plans = [
    { leads: 10, price: 89 },
    { leads: 20, price: 169 },
    { leads: 50, price: 399 },
    { leads: 100, price: 789 },
    { leads: 200, price: 1499 },
    { leads: '200+', price: null }
  ];
  const amount = document.querySelector('[data-pricing-amount]');
  const period = document.querySelector('[data-pricing-period]');
  const summary = document.querySelector('[data-pricing-summary]');
  const customCopy = document.querySelector('[data-pricing-custom-copy]');
  const customBooking = document.querySelector('[data-pricing-custom-booking]');
  const leadCounters = Array.from(document.querySelectorAll('[data-pricing-leads]'));
  const steps = Array.from(document.querySelectorAll('[data-pricing-step]'));
  const checkout = document.querySelector('[data-pricing-checkout]');
  const preferredBadge = document.querySelector('.pricing-config-badge');

  function updatePricing() {
    const index = Number(range.value);
    const plan = plans[index];
    const custom = plan.price === null;
    range.style.setProperty('--progress', (index / (plans.length - 1)) * 100 + '%');
    range.setAttribute('aria-valuetext', plan.leads + (isFr ? ' leads par semaine' : ' leads per week') + (custom ? (isFr ? ', sur mesure' : ', custom') : ''));
    amount.textContent = custom ? (isFr ? 'Sur mesure' : 'Custom') : new Intl.NumberFormat(isFr ? 'fr-FR' : 'en-US').format(plan.price) + ' €';
    period.hidden = custom;
    summary.hidden = custom;
    customCopy.hidden = !custom;
    customBooking.hidden = !custom;
    leadCounters.forEach(counter => { counter.textContent = String(plan.leads); });
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
      step.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
    preferredBadge.hidden = index !== Number(preferredBadge.dataset.planIndex ?? 1);
    checkout.hidden = custom;
    if (custom) {
      delete checkout.dataset.leads;
    } else {
      checkout.dataset.leads = String(plan.leads);
      checkout.setAttribute('href', 'https://app.syntheticswarm.ai/ui/?leads=' + plan.leads + '&lang=' + (isFr ? 'fr' : 'en'));
      // Closing the custom selector also prevents stale focusable calendar links.
      customBooking.querySelector('[data-disclosure-panel]').hidden = true;
      customBooking.querySelector('[data-book-demo]').setAttribute('aria-expanded', 'false');
    }
  }
  steps.forEach((step, index) => step.addEventListener('click', () => {
    range.value = String(index);
    updatePricing();
  }));
  // Every fresh load starts at 20, including browsers that restore form state.
  range.value = '1';
  range.addEventListener('input', updatePricing);
  range.addEventListener('change', updatePricing);
  updatePricing();
})();
