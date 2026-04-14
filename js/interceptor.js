(function () {
  "use strict";

  const EVENT_NAME = "__kf_finding__";
  const nonce = document.documentElement.getAttribute("data-kf-nonce") || "";
  document.documentElement.removeAttribute("data-kf-nonce");

  function emit(data) {
    data.__kfNonce = nonce;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
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
    return str.length >= 12 && shannonEntropy(str) > 3.5;
  }

  const globalNames = [
    "API_KEY", "api_key", "apiKey", "apikey",
    "SECRET", "secret", "secretKey", "secret_key",
    "TOKEN", "token", "accessToken", "access_token",
    "AUTH_TOKEN", "authToken", "auth_token",
    "STRIPE_KEY", "stripeKey", "stripe_key",
    "FIREBASE_CONFIG", "firebaseConfig",
    "AWS_ACCESS_KEY", "awsAccessKey",
    "__NEXT_DATA__", "__NUXT__", "__APP_CONFIG__",
    "__ENV__", "__CONFIG__", "ENV", "CONFIG",
  ];

  for (const name of globalNames) {
    try {
      const val = window[name];
      if (val === undefined || val === null) continue;
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      if (str.length < 8 || str === "[object Object]") continue;
      emit({
        match: `window.${name}=${str.substring(0, 200)}`,
        type: "window-global",
        patternName: "Exposed Global Variable",
        severity: "high",
        confidence: typeof val !== "object" && isHighEntropy(str.substring(0, 60)) ? "high" : "medium",
        provider: "JS Global Scan",
        isObject: typeof val === "object",
        rawText: typeof val === "object" ? str.substring(0, 5000) : null,
      });
    } catch {}
  }

  const origXhrOpen = XMLHttpRequest.prototype.open;
  const origXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._kfUrl = url;
    return origXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener("load", function () {
      try {
        const ct = this.getResponseHeader("content-type") || "";
        if (ct.includes("json") || ct.includes("javascript") || ct.includes("text")) {
          const body = this.responseText;
          if (body && body.length > 10 && body.length < 500000) {
            emit({
              type: "xhr-response",
              sourceUrl: String(this._kfUrl || ""),
              rawText: body,
            });
          }
        }
      } catch {}
    });
    return origXhrSend.apply(this, arguments);
  };

  const origFetch = window.fetch;
  window.fetch = async function () {
    const response = await origFetch.apply(this, arguments);
    try {
      const url = typeof arguments[0] === "string" ? arguments[0] : arguments[0]?.url || "";
      const cloned = response.clone();
      const ct = cloned.headers.get("content-type") || "";
      if (ct.includes("json") || ct.includes("javascript") || ct.includes("text")) {
        cloned.text().then((body) => {
          if (body && body.length > 10 && body.length < 500000) {
            emit({
              type: "fetch-response",
              sourceUrl: String(url || ""),
              rawText: body,
            });
          }
        }).catch(() => {});
      }
    } catch {}
    return response;
  };
})();
