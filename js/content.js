(async function () {
  "use strict";

  const pageUrl = location.href;
  const pageDomain = location.hostname;
  const seen = new Set();

  let keywords = [];
  try {
    const response = await chrome.runtime.sendMessage({ type: "getKeywords" });
    keywords = (response.keywords || []).map((k) => k.toLowerCase());
  } catch {
    return;
  }

  function shannonEntropy(str) {
    const len = str.length;
    if (len === 0) return 0;
    const freq = {};
    for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
    let entropy = 0;
    for (const ch in freq) {
      const p = freq[ch] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  function isHighEntropy(str) {
    if (str.length < 12) return false;
    return shannonEntropy(str) > 3.5;
  }

  function isFalsePositive(match) {
    if (!match || match.length < 8) return true;
    const lower = match.toLowerCase();
    const fp = [
      "true", "false", "null", "undefined", "function", "return",
      "window", "document", "object", "string", "number", "boolean",
      "prototype", "constructor", "adsbygoogle", "googletag",
      "use strict", "text/javascript", "application/json",
      "content-type", "text/html", "text/css", "image/png",
      "image/jpeg", "charset=utf-8", "viewport", "width=device",
      "http-equiv", "stylesheet", "text/plain",
    ];
    for (const f of fp) {
      if (lower === f) return true;
    }
    if (/^(0+|1+|a+|f+|x+)$/i.test(match)) return true;
    if (/^[a-z]+$/i.test(match) && match.length < 20) return true;
    if (/^(https?:\/\/)?[a-z0-9.-]+\.(js|css|html|png|jpg|gif|svg|woff|ttf|eot|ico)$/i.test(match)) return true;
    return false;
  }

  function report(data) {
    const key = `${data.type}:${data.match}:${data.url || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    try {
      chrome.runtime.sendMessage({
        type: "finding",
        data: { ...data, domain: pageDomain, pageUrl, timestamp: Date.now() },
      });
    } catch {}
  }

  function scanText(text, sourceUrl, sourceType) {
    if (!text || text.length < 10) return;

    for (const pattern of SECRET_PATTERNS) {
      pattern.re.lastIndex = 0;
      let m;
      while ((m = pattern.re.exec(text)) !== null) {
        const matched = m[1] || m[0];
        if (isFalsePositive(matched)) continue;
        report({
          url: sourceUrl,
          match: matched.substring(0, 200),
          type: sourceType,
          patternName: pattern.name,
          severity: pattern.severity,
          confidence: pattern.confidence,
          provider: pattern.provider,
        });
      }
    }

    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const kwRegex = new RegExp(
        `(?:${escaped})\\s*[:=]\\s*['"\`]([^'"\`\\n]{8,200})['"\`]`,
        "gi"
      );
      let m;
      while ((m = kwRegex.exec(text)) !== null) {
        const val = m[1];
        if (isFalsePositive(val)) continue;
        report({
          url: sourceUrl,
          match: val.substring(0, 200),
          type: sourceType,
          patternName: `Keyword: ${kw}`,
          severity: "medium",
          confidence: isHighEntropy(val) ? "high" : "medium",
          provider: "Keyword Match",
        });
      }
    }
  }

  function scanScriptSrcUrls() {
    const scripts = document.querySelectorAll("script[src]");
    for (const script of scripts) {
      const src = script.src;
      if (!src) continue;
      for (const kw of keywords) {
        if (src.toLowerCase().includes(kw)) {
          report({
            url: src, match: src, type: "script-src",
            patternName: `Script URL contains: ${kw}`,
            severity: "medium", confidence: "medium", provider: "URL Scan",
          });
        }
      }
      try {
        const url = new URL(src);
        for (const [param, value] of url.searchParams) {
          if (value.length >= 16 && isHighEntropy(value)) {
            report({
              url: src, match: `${param}=${value.substring(0, 100)}`,
              type: "url-param", patternName: "High-Entropy URL Parameter",
              severity: "medium", confidence: "medium", provider: "URL Scan",
            });
          }
        }
      } catch {}
    }
  }

  function scanInlineScripts() {
    const scripts = document.querySelectorAll("script:not([src])");
    for (const script of scripts) {
      scanText(script.textContent, pageUrl, "inline-script");
    }
  }

  async function scanExternalScripts() {
    const scripts = document.querySelectorAll("script[src]");
    const fetched = new Set();
    for (const script of scripts) {
      try {
        const src = script.src;
        if (fetched.has(src)) continue;
        if (new URL(src).origin !== location.origin) continue;
        fetched.add(src);
        const resp = await fetch(src, { credentials: "omit" });
        if (!resp.ok) continue;
        const text = await resp.text();
        scanText(text, src, "external-script");
      } catch {}
    }
  }

  function scanMetaTags() {
    const metas = document.querySelectorAll("meta");
    for (const meta of metas) {
      const content = meta.getAttribute("content");
      if (!content || content.length < 12) continue;
      const name = (meta.getAttribute("name") || meta.getAttribute("property") || "").toLowerCase();
      const sensitive = ["api-key", "api_key", "apikey", "token", "secret", "access-token", "csrf-token", "csrf_token"];
      if (sensitive.some((s) => name.includes(s))) {
        report({
          url: pageUrl, match: `meta[${name}]=${content.substring(0, 100)}`,
          type: "meta-tag", patternName: "Sensitive Meta Tag",
          severity: "high", confidence: "high", provider: "DOM Scan",
        });
      }
      scanText(`${name}=${content}`, pageUrl, "meta-tag");
    }
  }

  function scanHiddenInputs() {
    const inputs = document.querySelectorAll('input[type="hidden"]');
    for (const input of inputs) {
      const name = (input.name || input.id || "").toLowerCase();
      const value = input.value;
      if (!value || value.length < 8) continue;
      const sensitive = ["token", "csrf", "api_key", "apikey", "secret", "auth", "session", "nonce", "key", "access_token"];
      if (sensitive.some((s) => name.includes(s)) || isHighEntropy(value)) {
        report({
          url: pageUrl, match: `${name}=${value.substring(0, 100)}`,
          type: "hidden-input", patternName: "Hidden Form Field",
          severity: isHighEntropy(value) ? "high" : "medium",
          confidence: sensitive.some((s) => name.includes(s)) ? "high" : "medium",
          provider: "DOM Scan",
        });
      }
    }
  }

  function scanDataAttributes() {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      for (const attr of el.attributes) {
        if (!/^data-.*(?:key|token|secret|auth|api|credential|password)/i.test(attr.name)) continue;
        if (!attr.value || attr.value.length < 8) continue;
        report({
          url: pageUrl, match: `${attr.name}="${attr.value.substring(0, 100)}"`,
          type: "data-attribute", patternName: "Sensitive Data Attribute",
          severity: "medium", confidence: isHighEntropy(attr.value) ? "high" : "medium",
          provider: "DOM Scan",
        });
      }
    }
  }

  function scanHtmlComments() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_COMMENT, null);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent;
      if (text && text.length >= 20) {
        scanText(text, pageUrl, "html-comment");
      }
    }
  }

  function scanLinkHrefs() {
    const links = document.querySelectorAll("a[href], link[href]");
    for (const link of links) {
      try {
        const href = link.href;
        if (!href) continue;
        const url = new URL(href);
        for (const [param, value] of url.searchParams) {
          const p = param.toLowerCase();
          const sensitive = ["key", "api_key", "apikey", "token", "secret", "access_token", "auth", "password", "session_id"];
          if (sensitive.some((s) => p.includes(s)) && value.length >= 8) {
            report({
              url: href, match: `${param}=${value.substring(0, 100)}`,
              type: "url-param", patternName: "Sensitive URL Parameter",
              severity: "high", confidence: "high", provider: "URL Scan",
            });
          }
        }
      } catch {}
    }
  }

  function scanWebStorage() {
    const stores = [
      { store: localStorage, label: "localStorage" },
      { store: sessionStorage, label: "sessionStorage" },
    ];
    for (const { store, label } of stores) {
      try {
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          const value = store.getItem(key);
          if (!value || value.length < 12) continue;
          const kl = key.toLowerCase();
          const sensitive = ["token", "key", "secret", "auth", "session", "credential", "password", "jwt", "bearer"];
          if (sensitive.some((s) => kl.includes(s)) || isHighEntropy(value.substring(0, 100))) {
            report({
              url: pageUrl, match: `${label}.${key}=${value.substring(0, 120)}`,
              type: "web-storage", patternName: `${label} Secret`,
              severity: "high",
              confidence: sensitive.some((s) => kl.includes(s)) ? "high" : "medium",
              provider: "Storage Scan",
            });
          }
          scanText(`${key}=${value}`, pageUrl, "web-storage");
        }
      } catch {}
    }
  }

  function scanCookies() {
    try {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, ...rest] = cookie.split("=");
        if (!name) continue;
        const value = rest.join("=").trim();
        const n = name.trim().toLowerCase();
        const sensitive = ["token", "session", "auth", "jwt", "bearer", "api_key", "apikey", "secret", "credential"];
        if (value && value.length >= 16 && sensitive.some((s) => n.includes(s))) {
          report({
            url: pageUrl, match: `cookie:${name.trim()}=${value.substring(0, 80)}`,
            type: "cookie", patternName: "Sensitive Cookie",
            severity: "medium", confidence: "medium", provider: "Cookie Scan",
          });
        }
      }
    } catch {}
  }

  const kfNonce = document.documentElement.getAttribute("data-kf-verify") || "";
  document.documentElement.removeAttribute("data-kf-verify");

  window.addEventListener("__kf_finding__", (e) => {
    const data = e.detail;
    if (!data) return;
    if (data.__kfNonce !== kfNonce) return;

    if (data.rawText) {
      scanText(data.rawText, data.sourceUrl || pageUrl, data.type);
      if (!data.match) return;
    }

    if (data.match) {
      report({
        url: data.sourceUrl || pageUrl,
        match: data.match,
        type: data.type,
        patternName: data.patternName || data.type,
        severity: data.severity || "medium",
        confidence: data.confidence || "medium",
        provider: data.provider || "Runtime Scan",
      });
    }
  });

  scanScriptSrcUrls();
  scanInlineScripts();
  scanMetaTags();
  scanHiddenInputs();
  scanDataAttributes();
  scanHtmlComments();
  scanLinkHrefs();
  scanWebStorage();
  scanCookies();
  await scanExternalScripts();

  // Observe DOM mutations for SPA support
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.tagName === "SCRIPT") {
          if (node.src) {
            // New external script added
            for (const kw of keywords) {
              if (node.src.toLowerCase().includes(kw)) {
                report({
                  url: node.src, match: node.src, type: "script-src",
                  patternName: `Script URL contains: ${kw}`,
                  severity: "medium", confidence: "medium", provider: "URL Scan",
                });
              }
            }
          } else if (node.textContent) {
            scanText(node.textContent, pageUrl, "inline-script");
          }
        }
        // Scan any new hidden inputs
        const hiddenInputs = node.matches && node.matches('input[type="hidden"]')
          ? [node]
          : (node.querySelectorAll ? Array.from(node.querySelectorAll('input[type="hidden"]')) : []);
        for (const input of hiddenInputs) {
          const name = (input.name || input.id || "").toLowerCase();
          const value = input.value;
          if (!value || value.length < 8) continue;
          const sensitive = ["token", "csrf", "api_key", "apikey", "secret", "auth", "session", "nonce", "key", "access_token"];
          if (sensitive.some((s) => name.includes(s)) || isHighEntropy(value)) {
            report({
              url: pageUrl, match: `${name}=${value.substring(0, 100)}`,
              type: "hidden-input", patternName: "Hidden Form Field",
              severity: isHighEntropy(value) ? "high" : "medium",
              confidence: sensitive.some((s) => name.includes(s)) ? "high" : "medium",
              provider: "DOM Scan",
            });
          }
        }
        // Scan data attributes on new elements
        const elementsToCheck = node.querySelectorAll ? [node, ...node.querySelectorAll("*")] : [node];
        for (const el of elementsToCheck) {
          if (!el.attributes) continue;
          for (const attr of el.attributes) {
            if (!/^data-.*(?:key|token|secret|auth|api|credential|password)/i.test(attr.name)) continue;
            if (!attr.value || attr.value.length < 8) continue;
            report({
              url: pageUrl, match: `${attr.name}="${attr.value.substring(0, 100)}"`,
              type: "data-attribute", patternName: "Sensitive Data Attribute",
              severity: "medium", confidence: isHighEntropy(attr.value) ? "high" : "medium",
              provider: "DOM Scan",
            });
          }
        }
      }
    }
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

  if (seen.size > 0) {
    console.log(`[KeyFinder] ${seen.size} potential secret(s) found on ${pageDomain}`);
  }
})();
