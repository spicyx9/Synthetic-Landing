(function () {
  const isFr = document.documentElement.lang === 'fr';
  // Discovery entry offer: 10 prospects on activation, 10 more after 30 days,
  // access limited to 60 days. Quotas and expiry are enforced by the app.
  const discovery = { offer: 'discovery', initialLeads: 10, secondLeads: 10, secondAfterDays: 30, accessDays: 60 };
  const discoveryHref = 'https://app.syntheticswarm.ai/ui/?offer=' + discovery.offer + '&lang=' + (isFr ? 'fr' : 'en');

  const range = document.querySelector('[data-pricing-range]');
  if (!range) return;
  const plans = [
    { discovery: true },
    { leads: 10, price: 89 },
    { leads: 20, price: 169 },
    { leads: 50, price: 399 },
    { leads: 100, price: 789 },
    { leads: '100+', price: null }
  ];
  const labels = isFr
    ? { discovery: 'Découverte', title: 'Mode découverte', discoveryText: 'Mode découverte, 10 prospects à l’activation puis 10 après 30 jours, accès pendant 60 jours', custom: 'Sur mesure', perWeek: ' leads par semaine' }
    : { discovery: 'Discovery', title: 'Discovery mode', discoveryText: 'Discovery mode, 10 prospects on activation then 10 after 30 days, access for 60 days', custom: 'Custom', perWeek: ' leads per week' };
  const amount = document.querySelector('[data-pricing-amount]');
  const period = document.querySelector('[data-pricing-period]');
  const summary = document.querySelector('[data-pricing-summary]');
  const features = document.querySelector('[data-pricing-features]');
  const discoveryCopy = document.querySelector('[data-pricing-discovery-copy]');
  const customCopy = document.querySelector('[data-pricing-custom-copy]');
  const customBooking = document.querySelector('[data-pricing-custom-booking]');
  const volume = document.querySelector('[data-pricing-volume]');
  const leadCounters = Array.from(document.querySelectorAll('[data-pricing-leads]'));
  const steps = Array.from(document.querySelectorAll('[data-pricing-step]'));
  const checkout = document.querySelector('[data-pricing-checkout]');
  const checkoutLabels = Array.from(checkout.querySelectorAll('[data-checkout-label]'));
  const preferredBadge = document.querySelector('.pricing-config-badge');

  function updatePricing() {
    const index = Number(range.value);
    const plan = plans[index];
    const isDiscovery = plan.discovery === true;
    const custom = plan.price === null;
    range.style.setProperty('--progress', (index / (plans.length - 1)) * 100 + '%');
    range.setAttribute('aria-valuetext', isDiscovery ? labels.discoveryText : plan.leads + labels.perWeek + (custom ? ', ' + labels.custom.toLowerCase() : ''));
    amount.textContent = isDiscovery ? labels.title : custom ? labels.custom : new Intl.NumberFormat(isFr ? 'fr-FR' : 'en-US').format(plan.price) + ' €';
    period.hidden = custom || isDiscovery;
    summary.hidden = custom || isDiscovery;
    features.hidden = isDiscovery;
    discoveryCopy.hidden = !isDiscovery;
    customCopy.hidden = !custom;
    customBooking.hidden = !custom;
    if (volume) volume.textContent = isDiscovery ? labels.discovery : plan.leads + ' leads';
    if (!isDiscovery) leadCounters.forEach(counter => { counter.textContent = String(plan.leads); });
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
      step.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
    preferredBadge.hidden = index !== Number(preferredBadge.dataset.planIndex ?? 2);
    checkout.hidden = custom;
    if (custom) {
      delete checkout.dataset.leads;
      return;
    }
    if (isDiscovery) {
      delete checkout.dataset.leads;
      checkout.setAttribute('href', discoveryHref);
    } else {
      checkout.dataset.leads = String(plan.leads);
      checkout.setAttribute('href', 'https://app.syntheticswarm.ai/ui/?leads=' + plan.leads + '&lang=' + (isFr ? 'fr' : 'en'));
    }
    checkoutLabels.forEach(label => {
      label.classList.toggle('is-inactive', (label.dataset.checkoutLabel === 'discovery') !== isDiscovery);
    });
    // Closing the custom selector also prevents stale focusable calendar links.
    const bookingPanel = customBooking.querySelector('[data-disclosure-panel]');
    if (bookingPanel) bookingPanel.hidden = true;
    const bookingTrigger = customBooking.querySelector('[data-book-demo]');
    if (bookingTrigger) bookingTrigger.setAttribute('aria-expanded', 'false');
  }
  steps.forEach((step, index) => step.addEventListener('click', () => {
    range.value = String(index);
    updatePricing();
  }));
  // Every fresh load starts at 20, including browsers that restore form state.
  range.value = '2';
  range.addEventListener('input', updatePricing);
  range.addEventListener('change', updatePricing);
  updatePricing();
})();
