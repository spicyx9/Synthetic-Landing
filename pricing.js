(function () {
  const group = document.querySelector('.pricing-options');
  if (!group) return;
  const isFr = document.documentElement.lang === 'fr';
  const lang = isFr ? 'fr' : 'en';
  // Weekly plans. Discovery (10 prospects on activation, 10 more after 30 days,
  // 60 days of access) and custom are separate panels. The app enforces quotas.
  const prices = { 10: 89, 20: 169, 50: 399, 100: 789 };
  const options = Array.from(group.querySelectorAll('[data-pricing-option]'));
  const panels = Array.from(document.querySelectorAll('[data-pricing-panel]'));
  const amount = document.querySelector('[data-pricing-amount]');
  const leads = document.querySelector('[data-pricing-leads]');
  const checkout = document.querySelector('[data-pricing-checkout]');
  const discoveryCta = document.querySelector('[data-pricing-discovery-cta]');
  const badge = document.querySelector('[data-pricing-badge]');
  const format = new Intl.NumberFormat(isFr ? 'fr-FR' : 'en-US');
  discoveryCta.setAttribute('href', 'https://app.syntheticswarm.ai/ui/?offer=discovery&lang=' + lang);

  function select(option) {
    const key = option.dataset.pricingOption;
    const panel = key === 'discovery' || key === 'custom' ? key : 'plan';
    options.forEach(item => {
      const on = item === option;
      item.setAttribute('aria-checked', on ? 'true' : 'false');
      item.tabIndex = on ? 0 : -1;
    });
    panels.forEach(item => { item.hidden = item.dataset.pricingPanel !== panel; });
    badge.hidden = key !== '20';
    if (panel === 'plan') {
      amount.textContent = format.format(prices[key]) + ' €';
      leads.textContent = key;
      checkout.dataset.leads = key;
      checkout.setAttribute('href', 'https://app.syntheticswarm.ai/ui/?leads=' + key + '&lang=' + lang);
    }
  }

  options.forEach((option, index) => {
    option.addEventListener('click', () => select(option));
    option.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      const target = event.key === 'Home' ? options[0]
        : event.key === 'End' ? options[options.length - 1]
        : step ? options[(index + step + options.length) % options.length] : null;
      if (!target) return;
      event.preventDefault();
      select(target);
      target.focus();
    });
  });
  // Every fresh load starts at 20.
  select(options.find(option => option.dataset.pricingOption === '20'));
})();
