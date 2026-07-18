// Preview-only stub for the chrome.* extension API with realistic sample data.
// Loaded before the real popup.js / results.js in preview/*.html files.
// NOT shipped — build.sh only copies the explicit SHARED_FILES list.
(function () {
  const NOW = Date.now();
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  const SAMPLE_FINDINGS = [
    { id: "f1", severity: "critical", provider: "AWS", patternName: "AWS Access Key ID", match: "AKIAIOSFODNN7EXAMPLE", type: "inline-script", domain: "dashboard.acme.io", url: "https://dashboard.acme.io/assets/app.js", pageUrl: "https://dashboard.acme.io/", timestamp: NOW - 4 * MIN },
    { id: "f2", severity: "critical", provider: "Stripe", patternName: "Stripe Live Secret Key", match: "sk_live_4eC39HqLyj…T1zdp7dc", type: "network-response", domain: "api.shopfront.dev", url: "https://api.shopfront.dev/v2/config", pageUrl: "https://shopfront.dev/", timestamp: NOW - 26 * MIN },
    { id: "f3", severity: "critical", provider: "OpenAI", patternName: "OpenAI API Key", match: "sk-proj-abc123def456ghi789jkl", type: "web-storage", domain: "playground.internal.tools", url: "https://playground.internal.tools/", pageUrl: "https://playground.internal.tools/", timestamp: NOW - 2 * HOUR },
    { id: "f4", severity: "high", provider: "GitHub", patternName: "GitHub Personal Access Token", match: "ghp_16C7e42F292c6912E7710c838347Ae178B4a", type: "html-comment", domain: "gitmirror.example.org", url: "https://gitmirror.example.org/login", pageUrl: "https://gitmirror.example.org/", timestamp: NOW - 3 * HOUR },
    { id: "f5", severity: "high", provider: "Slack", patternName: "Slack Bot Token", match: "xoxb-17653672481-19874698323-pdLjLl…CwXgE", type: "inline-script", domain: "status.teamchat.app", url: "https://status.teamchat.app/embed.js", pageUrl: "https://status.teamchat.app/", timestamp: NOW - 5 * HOUR },
    { id: "f6", severity: "high", provider: "MongoDB", patternName: "MongoDB Connection String", match: "mongodb+srv://admin:p4ssw0rd@cluster0.mongodb.net/prod", type: "data-attribute", domain: "metrics.saasly.co", url: "https://metrics.saasly.co/", pageUrl: "https://metrics.saasly.co/", timestamp: NOW - 9 * HOUR },
    { id: "f7", severity: "high", provider: "DOM Scan", patternName: "Sensitive Meta Tag", match: "csrf-token=9f8e7d6c5b4a3210", type: "meta-tag", domain: "legacy.corpnet.com", url: "https://legacy.corpnet.com/index.html", pageUrl: "https://legacy.corpnet.com/", timestamp: NOW - 14 * HOUR },
    { id: "f8", severity: "medium", provider: "Generic", patternName: "JSON Web Token (JWT)", match: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U", type: "url-param", domain: "auth.redirectlab.net", url: "https://auth.redirectlab.net/callback?token=eyJhbGciOi...", pageUrl: "https://redirectlab.net/", timestamp: NOW - 20 * HOUR },
    { id: "f9", severity: "medium", provider: "DOM Scan", patternName: "Hidden Form Field", match: "session_id=a8f5f167f44f4964e6c998dee827110c", type: "hidden-input", domain: "shop.example.com", url: "https://shop.example.com/checkout", pageUrl: "https://shop.example.com/", timestamp: NOW - 1 * DAY },
    { id: "f10", severity: "medium", provider: "URL Scan", patternName: "High-Entropy URL Parameter", match: "sig=4c4f6e6f2d9a4b8c8d7e6f5a4b3c2d1e", type: "url-param", domain: "cdn.medialab.io", url: "https://cdn.medialab.io/v/assets?sig=4c4f6e...", pageUrl: "https://medialab.io/", timestamp: NOW - 2 * DAY },
    { id: "f11", severity: "medium", provider: "Web Storage", patternName: "localStorage Secret", match: "refresh_token=def502001a2b3c4d5e6f", type: "web-storage", domain: "app.notesync.dev", url: "https://app.notesync.dev/", pageUrl: "https://app.notesync.dev/", timestamp: NOW - 3 * DAY },
    { id: "f12", severity: "low", provider: "Generic", patternName: "Keyword: client_id", match: "client_id=Iv1.8a61f9b3a7aba766", type: "script-src", domain: "login.oauthflow.app", url: "https://login.oauthflow.app/js/oauth.js?client_id=Iv1.8a61f9b3a7aba766", pageUrl: "https://login.oauthflow.app/", timestamp: NOW - 4 * DAY },
  ];

  const SAMPLE_KEYWORDS = [
    "key", "api_key", "apikey", "api-key", "secret", "token",
    "access_token", "auth", "credential", "password", "client_id", "client_secret",
  ];

  window.chrome = {
    runtime: {
      getManifest: () => ({ version: "2.2.1" }),
      sendMessage: async (msg) => {
        switch (msg && msg.type) {
          case "getFindings": return { findings: SAMPLE_FINDINGS.slice() };
          case "getKeywords": return { keywords: SAMPLE_KEYWORDS.slice() };
          case "addKeyword": return { ok: true };
          case "removeKeyword": return { ok: true };
          case "removeFinding": return { ok: true };
          case "clearFindings": return { ok: true };
          default: return {};
        }
      },
    },
  };
})();
