# Customer stories

Edit `assets/data/customers.json`. Keep `customers` empty until real, approved customer feedback is supplied.
One customer requires one supplied photo (optional) and one object. No HTML edits are needed.

Fields:

- `name`, `role`, `company`: real identity and role.
- `photo`: optional `/assets/customers/filename.jpg` or explicitly provided HTTPS image URL.
- `linkedinUrl`: optional real HTTPS LinkedIn `/in/` URL. Missing/invalid URLs produce no link.
- `testimonialFr`, `testimonialEn`: approved localized quote. `testimonial` can hold an approved shared quote.
- `metric`: optional verified result, either a string or `{ "fr": "", "en": "" }`. Empty by default.
- `date`: optional ISO date `YYYY-MM-DD`.
- `category`: optional `broker`, `general-agent`, `firm`, or `other`. No UI filters yet.
- `verified`: set `true` only after identity, quote, image and publication permission are verified.
- `kind`: optional `testimonial` (default) or `identity` for a real customer identity card without a quote.

Only verified records with a name and a quote for the current language render as testimonials.
Identity cards require a real company as well. Missing photos use initials, not stock images.
Input order is display order on every screen. Place the newest entries first if desired.
Homepage preview remains hidden until three verified localized testimonials are present; it displays the first three.

Statistics require both `enabled: true` and a nonempty real `value`, plus the localized label.
No placeholder numbers are included. Add only substantiated values; never enable an estimate or template.
