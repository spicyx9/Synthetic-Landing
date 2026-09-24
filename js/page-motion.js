window.SwarmMotion?.ready(M => {
  const main = document.querySelector('main');
  if (!main) return;
  const legal = main.matches('.legal-page,.privacy-page,.terms-page');
  if (legal) {
    const heading = main.querySelector('h1');
    const first = main.querySelector('p');
    M.sequence(main,[M.step(heading,0,'fade',400),M.step(first,100,'fade',400)],{entrance:true});
    return;
  }
  if (!main.matches('.about-page,.careers-page,.solution-page')) {
    const intro = main.querySelector('.page-intro');
    if (intro) M.sequence(intro,[...intro.children].map((element,i)=>M.step(element,80+i*100,element.tagName==='H1'?'line':'rise')),{entrance:true});
  }
  document.querySelectorAll('.pricing-section').forEach(root => {
    const steps = [];
    const add = (selector,delay,effect='rise') => root.querySelectorAll(selector).forEach((element,i)=>steps.push(M.step(element,delay+i*80,effect)));
    add(':scope > h1,:scope > h2',0,'line'); add(':scope > p',100);
    add('.pricing-config-card',220,'surface');
    add('.pricing-options',340,'fade');
    add('.pricing-panel:not([hidden]) .pricing-panel-price,.pricing-panel:not([hidden]) .pricing-panel-title',520,'fade');
    add('.pricing-panel:not([hidden]) .pricing-config-features li',640,'fade');
    add('.pricing-panel:not([hidden]) .pricing-config-btn',860);
    M.sequence(root,steps,{entrance:!document.querySelector('.home-focused-hero')});
  });
  const amount = document.querySelector('[data-pricing-amount]');
  const animatePrice = () => { if (amount) M.replay(amount,[M.step(amount,0,'surface',160)]); };
  document.querySelectorAll('[data-pricing-option]').forEach(button=>button.addEventListener('click',animatePrice));
  const faqGroups = new Set([...main.querySelectorAll('.site-faq,.pricing-faq-item')].map(item=>item.parentElement));
  faqGroups.forEach(root => M.sequence(root,[...root.querySelectorAll(':scope > h2,:scope > details')].map((element,i)=>M.step(element,i*70,'fade',400))));
  const contact = main.querySelector('.contact-details');
  if (contact) {
    M.sequence(contact,[...contact.querySelectorAll('.contact-founder,.contact-email')].map((element,i)=>M.step(element,320+i*120)),{entrance:true});
    const form = main.querySelector('.contact-form');
    M.sequence(form,[M.step(form,520,'surface')],{entrance:true});
    const status = main.querySelector('.contact-status');
    if (status) new MutationObserver(()=>{if(status.textContent.trim()) M.replay(status,[M.step(status,0,'fade',160)]);}).observe(status,{childList:true,subtree:true,characterData:true});
  }
  const newsletter = main.querySelector('#newsletter');
  if (newsletter) M.sequence(newsletter,[M.step(newsletter,0,'fade',400)]);
  main.querySelectorAll('.home-customer-proof,[data-customer-stories]').forEach(root=> {
    M.sequence(root,[...root.querySelectorAll(':scope > h2,.customer-placeholder,.customer-card')].map((element,i)=>M.step(element,i*90,'fade',400)));
  });
  main.querySelectorAll('details').forEach(details => details.addEventListener('toggle',()=> {
    if (!details.open) return;
    const content = [...details.children].filter(element=>element.tagName!=='SUMMARY');
    content.forEach(element=>M.replay(element,[M.step(element,0,'fade',160)]));
  }));
});
