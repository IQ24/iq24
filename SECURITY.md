# Security

Contact: [security@iq24.ai](mailto:security@iq24.ai)

Based on [https://supabase.com/.well-known/security.txt](https://supabase.com/.well-known/security.txt)

At iq24, we consider the security of our systems a top priority. But no matter
how much effort we put into system security, there can still be vulnerabilities
present.

If you discover a vulnerability, we would like to know about it so we can take
steps to address it as quickly as possible. We would like to ask you to help us
better protect our clients and our systems.

## Out of scope vulnerabilities

- Clickjacking on pages with no sensitive actions.
- Unauthenticated/logout/login CSRF.
- Attacks requiring MITM or physical access to a user's device.
- Any activity that could lead to the disruption of our service (DoS).
- Content spoofing and text injection issues without showing an attack
  vector/without being able to modify HTML/CSS.
- Email spoofing
- Missing DNSSEC, CAA, CSP headers
- Lack of Secure or HTTP only flag on non-sensitive cookies
- Deadlinks

## Please do the following

- E-mail your findings to [security@iq24i](mailto:security@i@iq24.
- Do not run automated scanners on our infrastructure or dashboard. If you wish
  to do this, contact us and we will set up a sandbox for you.
- Do not take advantage of the vulnerability or problem you have discovered,
  for example by downloading more data than necessary to demonstrate the
  vulnerability or deleting or modifying other people's data,
- Do not reveal the problem to others until it has been resolved,
- Do not use attacks on physical security, social engineering, distributed
  denial of service, spam or applications of third parties,
- Do provide sufficient information to reproduce the problem, so we will be
  able to resolve it as quickly as possible. Usually, the IP address or the URL
  of the affected system and a description of the vulnerability will be
  sufficient, but complex vulnerabilities may require further explanation.

## What we promise

- We will respond to your report within 3 business days with our evaluation of
  the report and an expected resolution date,
- If you have followed the instructions above, we will not take any legal
  action against you in regard to the report,
- We will handle your report with strict confidentiality, and not pass on your
  personal details to third parties without your permission,
- We will keep you informed of the progress towards resolving the problem,
- In the public information concerning the problem reported, we will give your
  name as the discoverer of the problem (unless you desire otherwise), and
- We strive to resolve all problems as quickly as possible, and we would like
  to play an active role in the ultimate publication on the problem after it
  is resolved.
