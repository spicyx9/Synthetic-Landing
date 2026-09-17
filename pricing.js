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

  function formatPrice(value) {
    return new Intl.NumberFormat(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-US').format(value);
  }

  function updatePricing() {
    const index = Number(range.value);
    const plan = plans[index];
    const progress = (index / (plans.length - 1)) * 100;

    range.style.setProperty('--progress', progress + '%');
    if (amount) amount.textContent = formatPrice(plan.price) + ' €';
    leadCounters.forEach(function (counter) {
      counter.textContent = String(plan.leads);
    });

    steps.forEach(function (step, stepIndex) {
      step.classList.toggle('is-active', stepIndex === index);
    });

    if (checkout) {
      checkout.dataset.leads = String(plan.leads);
      checkout.dataset.price = String(plan.price);
    }
  }

  range.addEventListener('input', updatePricing);
  range.addEventListener('change', updatePricing);
  updatePricing();
})();
