# KeyFinder — Store Listing Kit (v2.2.1)

Copy-paste ready text for the Chrome Web Store and Firefox Add-ons (AMO) dashboards.
Screenshots referenced below are in `store/`.

---

## 1. Chrome Web Store

**Category:** Developer Tools
**Language:** English

### Short description (max 132 chars — this is 121)

```
Passive scanner for leaked API keys, tokens & secrets. 80+ patterns, 10 attack surfaces, zero config, local-only storage.
```

### Detailed description

```
KeyFinder passively discovers API keys, tokens, secrets, and credentials leaked in the pages you visit. It runs silently in the background — no configuration, no accounts, no cloud. Browse normally; KeyFinder watches for secrets that should never have shipped.

WHAT IT DETECTS
80+ detection patterns across the providers that matter:
• Cloud — AWS (access keys, secret keys, session tokens, Cognito), Google Cloud (API keys, OAuth, service accounts), Azure (storage keys, SAS tokens, connection strings)
• Source control — GitHub (PATs, OAuth, fine-grained), GitLab, Bitbucket
• Payments — Stripe (secret, publishable, restricted, webhook), PayPal Braintree, Square
• Communication — Slack, Discord, Telegram, Twilio, SendGrid
• AI/ML — OpenAI, Anthropic, HuggingFace, Replicate
• Databases — MongoDB, PostgreSQL, MySQL, Redis connection strings
• SaaS & infra — Shopify, Sentry, Datadog, Cloudflare, DigitalOcean, HashiCorp Vault, NPM, Docker Hub, and more
• Generic — JWTs, Bearer tokens, Basic Auth, credential URLs, plus Shannon entropy analysis for undocumented formats

HOW IT WORKS
Every page is scanned across 10 attack surfaces: script src URLs, inline scripts, same-origin external scripts, meta tags, hidden form fields, data attributes, HTML comments, URL parameters, localStorage/sessionStorage, and intercepted XHR/Fetch responses. A MutationObserver re-scans dynamically injected DOM, so single-page apps are covered too.

THE FINDINGS CONSOLE
A flat, terminal-style dashboard built for triage:
• Severity-sorted findings (critical → high → medium → low)
• Click a severity tile to filter instantly; filter by type or provider
• Latest-finding ticker and live search (/ to focus, Esc to clear)
• Click any match to copy the secret; relative timestamps with absolute on hover
• One-click export of filtered results as JSON or CSV (formula-injection sanitised)

PRIVACY
All findings stay on your machine. Local storage only, no network egress, no analytics, no accounts. Open source: github.com/momenbasel/keyFinder

DISCLAIMER
Intended for security research and authorized testing only. Use it on your own applications or during authorized penetration tests.
```

### Screenshots (upload in this order)

| # | File | Why |
|---|------|-----|
| 1 | `store/store-1-dashboard.png` | The findings console fully loaded — the product's money shot |
| 2 | `store/store-2-popup.png` | Hero composition: what it is + the popup UI |
| 3 | `store/store-3-empty.png` | Zero-noise empty state — reinforces the privacy promise |

### Privacy tab — single-purpose & permission justifications

**Single purpose:** Passively scans visited pages for leaked API keys, tokens, and secrets, and displays them locally to the user.

**`activeTab`:** Required to scan the DOM and resources of the page the user is currently viewing for leaked secrets.

**`storage`:** Required to persist findings and the user's custom keyword list locally on the device. No data leaves the machine.

**Host permissions (`<all_urls>` content scripts):** Secret leakage can occur on any page. The extension must scan script URLs, inline code, DOM attributes, storage, and network responses on every visited page to fulfill its single purpose. All processing is local; nothing is transmitted.

**Remote code:** No remote code is executed. All scanning logic ships inside the extension package.

**Data collection:** None. No personal, sensitive, or browsing data is collected, transmitted, or shared. Findings are stored locally with a 5000-item cap and can be cleared at any time.

---

## 2. Firefox Add-ons (AMO)

**Categories:** Security & Privacy; Developer Tools
**Tags:** security, api keys, secrets, pentest, developer tools, scanner, credentials, privacy

### Summary (max 250 chars — this is 229)

```
Passively discovers API keys, tokens, and secrets leaked in the pages you visit. 80+ patterns across 10 attack surfaces, entropy analysis, SPA-aware rescanning, terminal-style findings console. Zero config, local-only, no egress.
```

### Description (AMO allows basic HTML)

```html
<p><b>KeyFinder</b> passively discovers API keys, tokens, secrets, and credentials leaked in the pages you visit. No configuration, no accounts, no cloud — browse normally and KeyFinder watches for secrets that should never have shipped.</p>

<p><b>What it detects — 80+ patterns:</b></p>
<ul>
  <li>Cloud: AWS, Google Cloud, Azure</li>
  <li>Source control: GitHub, GitLab, Bitbucket</li>
  <li>Payments: Stripe, PayPal Braintree, Square</li>
  <li>Communication: Slack, Discord, Telegram, Twilio, SendGrid</li>
  <li>AI/ML: OpenAI, Anthropic, HuggingFace, Replicate</li>
  <li>Databases: MongoDB, PostgreSQL, MySQL, Redis</li>
  <li>SaaS &amp; infrastructure: Shopify, Sentry, Datadog, Cloudflare, DigitalOcean, Vault, NPM, Docker Hub</li>
  <li>Generic: JWTs, Bearer tokens, Basic Auth, credential URLs, high-entropy strings (Shannon entropy analysis)</li>
</ul>

<p><b>How it works:</b> every page is scanned across 10 attack surfaces — script URLs, inline and external scripts, meta tags, hidden form fields, data attributes, HTML comments, URL parameters, web storage, and intercepted XHR/Fetch responses. A MutationObserver re-scans dynamically injected DOM for SPA coverage.</p>

<p><b>The findings console:</b> a flat, terminal-style dashboard built for triage — severity-sorted findings, click-to-filter severity tiles, latest-finding ticker, live search (<code>/</code> to focus, <code>Esc</code> to clear), click-to-copy secrets, and one-click JSON/CSV export of filtered results.</p>

<p><b>Privacy:</b> all findings stay on your machine. Local storage only, no network egress, no analytics. Open source: <a href="https://github.com/momenbasel/keyFinder">github.com/momenbasel/keyFinder</a></p>

<p><i>Intended for security research and authorized testing only.</i></p>
```

### Screenshots (same order as Chrome)

1. `store/store-1-dashboard.png`
2. `store/store-2-popup.png`
3. `store/store-3-empty.png`

### Reviewer notes (paste into "Notes for Reviewers" if asked)

```
The extension scans visited pages locally for leaked secrets and stores findings in browser storage only. Nothing is transmitted off the device — the manifest declares data_collection_permissions: none. All scanning logic is contained in the package; no remote code is loaded. Source: https://github.com/momenbasel/keyFinder (tag v2.2.1 matches this upload).
```

---

## 3. Shared assets checklist

- [x] Icon set (16/48/128) — `icons/`
- [x] Screenshots 1280×800 — `store/`
- [x] Privacy policy — `PRIVACY.md` (host its raw GitHub URL in store dashboards that ask: `https://github.com/momenbasel/keyFinder/blob/master/PRIVACY.md`)
- [x] Homepage URL — `https://github.com/momenbasel/keyFinder`
- [x] Promotional video — `store/store-demo.mp4` (1280×720, 30 fps, 12.3 s: title card → console pan → popup; upload to YouTube as unlisted and paste the link in both store dashboards)
