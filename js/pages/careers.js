// Native disclosures retain keyboard and no-JavaScript support.
const roles = [...document.querySelectorAll('.job-item')];
roles.forEach(role => role.addEventListener('toggle', () => {
  role.querySelector('summary').setAttribute('aria-expanded', String(role.open));
  if (role.open) roles.forEach(other => { if (other !== role) other.open = false; });
}));
