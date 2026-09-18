# Contact delivery

`/api/contact` is a Vercel Node.js function. It sends plain-text messages to
`contact@syntheticswarm.ai` through the [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

Set these server-side variables in the Vercel project, then redeploy:

- `RESEND_API_KEY`: a Resend key with sending permission.
- `CONTACT_FROM_EMAIL`: an address on a domain verified in Resend.

No provider or credentials were configured in the repository. Until configured,
valid submissions return HTTP 503 and the UI displays the error message; no send
is claimed. A 200 response means the provider accepted the email, not confirmed
inbox delivery. Provider failures and timeouts return 502 without exposing details.

The visitor email is Reply-To, never the sender. The destination is fixed server-side.
The API validates required fields and lengths, rejects a filled honeypot and allows
five attempts per ten minutes per IP on each warm instance. This in-memory limit is
best-effort, not a distributed quota; use Vercel Firewall for persistent global limits.
No submitted content or API keys are logged. Tests mock provider responses and send
no messages. To test delivery after configuration, use an authorised test submission
and confirm receipt in the contact mailbox.
