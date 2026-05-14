# Security Policy

## Reporting a vulnerability

Email **security reports** privately to the address on the maintainer's GitHub profile.
Do **not** open a public issue for unpatched vulnerabilities.

When reporting, include:
- Affected version (`manifest.json` `version` field)
- Browser and version
- Steps to reproduce
- Impact assessment (what an attacker gains)

A response is targeted within 7 days.

## Threat model

KeyFinder runs as a content script in every page the user visits and reports findings to a service worker. It is **client-side, passive, and read-only** with respect to the page.

### In scope
- Privilege escalation from a malicious page into the extension's service worker
- Persistent storage poisoning via crafted findings
- Cross-tab data leakage through `chrome.storage`
- CSV / JSON export injection (formulas, embedded HTML, JS)
- Manifest / CSP weaknesses enabling code injection into the extension's own pages
- Pattern-rule false positives that consistently leak benign data into findings

### Out of scope
- A malicious page generating **fake findings** in the user's results view. The MAIN-world interceptor and the ISOLATED content script communicate over `CustomEvent` with a per-page nonce stored as a `data-kf-verify` attribute on `documentElement`. The nonce is removed once the content script consumes it, but a page script that runs between `document_start` and `document_idle` can read the attribute and forge events. Mitigation cost is high (Symbols don't cross realms; postMessage is also page-visible). The impact is limited to **showing the user a finding that isn't real** - no data is exfiltrated, no privileged API is reached. Treat findings on a hostile page as advisory.
- Detection accuracy of individual regex rules. False positives and false negatives are expected; report a tuning issue rather than a CVE.
- Extension being uninstalled or disabled by the user.

## What the extension can see

| Surface | Scope |
|---|---|
| Page DOM | All pages (`<all_urls>`) at `document_idle` (ISOLATED world) and `document_start` (MAIN world interceptor) |
| Network | `fetch` and `XMLHttpRequest` responses initiated by the page (response bodies up to 500 KB are scanned) |
| Web storage | `localStorage`, `sessionStorage`, `document.cookie` on the page |
| Inter-extension | None. No host permissions beyond `activeTab` and `storage` |

The extension makes **no outbound network requests** other than fetching same-origin scripts already referenced by the page.

## Known limitations

- **Per-tab badge dot** is set on the first finding only; subsequent findings update the count but not the icon
- **5000 finding cap** with FIFO eviction. High-volume scans (heavy SPAs over a long session) will drop oldest findings
- **CSV export** prefixes a single-quote on cells starting with `=`, `+`, `-`, `@`, tab, or carriage return to neutralise Excel / Sheets formula injection. Line-feed prefix is not currently neutralised
- **Service worker restarts** drop the in-flight `storageQueue` Promise chain. Subsequent storage writes are still serialised; only pending writes from the killed worker are lost

## Supported versions

| Version | Supported |
|---|---|
| 2.1.x | yes |
| 2.0.x | no |
| < 2.0 | no |
