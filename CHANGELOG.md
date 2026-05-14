# Changelog

All notable changes to KeyFinder are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-05-14

### Added
- `SECURITY.md` with threat model, disclosure policy, and known limitations of the MAIN <-> ISOLATED nonce bridge
- `.github/dependabot.yml` for weekly GitHub Actions version bumps
- `CHANGELOG.md`

### Changed
- CSV export sanitiser now also prefixes cells starting with LF (`\n`), not just `=`, `+`, `-`, `@`, tab, CR
- Popup and results page version label is now read from the manifest at runtime instead of being hardcoded

### Fixed
- Window-global scan in `js/interceptor.js` now runs at `document_start`, `DOMContentLoaded`, and `load`, with per-name dedupe. The previous implementation only scanned at `document_start` when page globals had not yet been assigned, making the entire pass dead code on most real pages

## [2.1.0] - 2026-04-14

### Added
- Per-session nonce validation between MAIN-world interceptor and ISOLATED content script to prevent forged finding injection
- CSV formula-injection sanitiser on findings export
- Serialised storage writes to eliminate cross-tab race conditions
- 5000-finding cap with FIFO eviction
- Per-tab alert badge with red-dot icon overlay when secrets are detected
- MutationObserver scans dynamically-injected DOM nodes for SPA coverage
- Explicit Content Security Policy in Chrome and Firefox manifests
- `js/interceptor-loader.js` for both browsers, replacing direct MAIN-world content script on Firefox so the nonce handoff actually works
- GitHub Actions release pipeline (`.github/workflows/release.yml`): on `v*` tag, build Chrome + Firefox zips, compute SHA256, attach to GitHub Release
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`): manifest JSON validation, Chrome <-> Firefox version parity check, build verification, `web-ext lint` on the Firefox bundle

### Changed
- Keyword input validation: 50 character maximum, 50 keyword maximum
- Findings are now deleted by unique ID instead of URL substring match
- URL parameter scanner uses exact match instead of substring (was matching `author` as `auth`)
- Keyword scanner enforces word boundaries (was matching `key` inside `hotkey`, `monkey`)
- camelCase JS identifiers are now skipped in keyword value matches
- Sentry DSN downgraded from `high` to `low` severity (public by design)

### Fixed
- Stored finding race conditions across concurrent tabs
- False positives from GitHub localStorage caches (`ref-selector:*`, `jump_to:*`, `soft-nav:*`, `COPILOT_*`)
- False positives from common CSRF tokens (`authenticity_token`, `csrf_token`, `__RequestVerificationToken`)
- False positives from keyboard shortcut data attributes (`data-hotkey`, `data-hotkey-scope`)

## [2.0.0] - 2026-04-07

### Added
- Complete rewrite to Manifest V3
- Enterprise-grade secret detection with 80+ regex patterns covering AWS, GCP, Azure, GitHub, GitLab, Stripe, PayPal, Square, Slack, Discord, and more
- Firefox support (MV3, Firefox 128+)
- Privacy policy
- Replaced demo gifs with professional logo

### Removed
- Manifest V2 background page
- Legacy jQuery dependency
