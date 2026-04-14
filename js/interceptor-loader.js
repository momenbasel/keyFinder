(function () {
  "use strict";

  const nonce = crypto.randomUUID();

  // Store nonce where both MAIN world (interceptor) and ISOLATED world (content.js) can read it.
  // The interceptor removes data-kf-nonce after reading; data-kf-verify stays for content.js.
  const el = document.documentElement;
  el.setAttribute("data-kf-nonce", nonce);
  el.setAttribute("data-kf-verify", nonce);

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("js/interceptor.js");
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => script.remove();
})();
