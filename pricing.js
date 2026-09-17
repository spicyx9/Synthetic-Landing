(function () {
  const range = document.querySelector('[data-pricing-range]');
  if (!range) return;

  const plans = [
    { leads: 10, price: 89 },
    { leads: 20, price: 169 },
    { leads: 50, price: 399 },
    { leads: 100, price: 789 },
    { leads: 200, price: 1499 }
  ];

  const amount = document.querySelector('[data-pricing-amount]');
  const leadCounters = Array.from(document.querySelectorAll('[data-pricing-leads]'));
  const steps = Array.from(document.querySelectorAll('[data-pricing-step]'));
  const checkout = document.querySelector('[data-pricing-checkout]');
  const preferredBadge = document.querySelector('.pricing-config-badge');

  function formatPrice(value) {
    return new Intl.NumberFormat(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US').format(value);
  }

  function updatePricing() {
    const index = Number(range.value);
    const plan = plans[index];
    const progress = (index / (plans.length - 1)) * 100;

    range.style.setProperty('--progress', progress + '%');
    range.setAttribute('aria-valuetext', plan.leads + (document.documentElement.lang === 'fr' ? ' leads par semaine' : ' leads per week'));
    if (amount) amount.textContent = formatPrice(plan.price) + ' €';
    leadCounters.forEach(function (counter) {
      counter.textContent = String(plan.leads);
    });

    steps.forEach(function (step, stepIndex) {
      step.classList.toggle('is-active', stepIndex === index);
      step.setAttribute('aria-pressed', stepIndex === index ? 'true' : 'false');
    });

    // Only 50 leads / 399 € is the preferred plan.
    if (preferredBadge) {
      preferredBadge.hidden = index !== 2;
    }

    if (checkout) {
      checkout.dataset.leads = String(plan.leads);
      checkout.dataset.price = String(plan.price);
    }
  }

  // Clicking a number is equivalent to moving the slider to that step.
  steps.forEach(function (step, index) {
    step.addEventListener('click', function () {
      range.value = String(index);
      updatePricing();
    });
  });

  // Reset restored form state so every fresh page load starts at the preferred tier.
  range.value = '2';
  range.addEventListener('input', updatePricing);
  range.addEventListener('change', updatePricing);
  updatePricing();
})();
