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

  // Pricing-specific layout fixes. The five labels are anchored to the exact
  // slider positions (0 / 25 / 50 / 75 / 100%), instead of being distributed
  // inside five grid cells, which made 20 and 100 visibly miss the thumb.
  const style = document.createElement('style');
  style.textContent = [
    '.pricing-config-badge[hidden]{display:none!important}',
    '.pricing-range-steps{position:relative;display:block;height:24px;margin-top:12px}',
    '.pricing-range-steps [data-pricing-step]{position:absolute;top:0;text-align:center;cursor:pointer;transition:color .15s ease,font-weight .15s ease}',
    '.pricing-range-steps [data-pricing-step]:nth-child(1){left:0;transform:none}',
    '.pricing-range-steps [data-pricing-step]:nth-child(2){left:25%;transform:translateX(-50%)}',
    '.pricing-range-steps [data-pricing-step]:nth-child(3){left:50%;transform:translateX(-50%)}',
    '.pricing-range-steps [data-pricing-step]:nth-child(4){left:75%;transform:translateX(-50%)}',
    '.pricing-range-steps [data-pricing-step]:nth-child(5){left:100%;transform:translateX(-100%)}',
    '.pricing-config-card{overflow:visible}',
    '@media(max-width:600px){.pricing-range-steps{height:22px}.pricing-range-steps [data-pricing-step]{font-size:11px}}'
  ].join('');
  document.head.appendChild(style);

  const amount = document.querySelector('[data-pricing-amount]');
  const leadCounters = Array.from(document.querySelectorAll('[data-pricing-leads]'));
  const steps = Array.from(document.querySelectorAll('[data-pricing-step]'));
  const checkout = document.querySelector('[data-pricing-checkout]');
  const preferredBadge = document.querySelector('.pricing-config-badge');

  // The FAQ must always start closed: the + is visible until the visitor clicks.
  document.querySelectorAll('.pricing-faq-item').forEach(function (item) {
    item.open = false;
    item.removeAttribute('open');
  });

  // Remove the availability qualifier from the pricing feature line.
  document.querySelectorAll('.pricing-config-features li span:last-child').forEach(function (label) {
    label.textContent = label.textContent
      .replace(' quand disponibles', '')
      .replace(' when available', '');
  });

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
      step.setAttribute('aria-current', stepIndex === index ? 'true' : 'false');
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

  range.addEventListener('input', updatePricing);
  range.addEventListener('change', updatePricing);
  updatePricing();
})();
