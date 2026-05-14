const KEYWORDS_KEY = "kf_keywords";
const FINDINGS_KEY = "kf_findings";
const MAX_FINDINGS = 5000;
const MAX_KEYWORDS = 50;
const MAX_KEYWORD_LENGTH = 50;

const DEFAULT_KEYWORDS = [
  "key", "api_key", "apikey", "api-key", "secret", "token",
  "access_token", "auth", "credential", "password",
  "client_id", "client_secret"
];

// Serialize all storage writes to prevent race conditions
let storageQueue = Promise.resolve();
function enqueue(fn) {
  storageQueue = storageQueue.then(fn, fn);
  return storageQueue;
}

// --- Per-tab alert icon ---
const alertTabs = new Set();
let alertIconCache = null;

async function buildAlertIcons() {
  if (alertIconCache) return alertIconCache;
  const sizes = [16, 48];
  const imageData = {};
  for (const size of sizes) {
    const resp = await fetch(chrome.runtime.getURL(`icons/icon${size}.png`));
    const blob = await resp.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, size, size);
    // Red alert dot in top-right
    const r = Math.max(3, Math.round(size * 0.22));
    const cx = size - r - 1;
    const cy = r + 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4444";
    ctx.fill();
    ctx.lineWidth = size >= 48 ? 2 : 1;
    ctx.strokeStyle = "#0f0f0f";
    ctx.stroke();
    imageData[size] = ctx.getImageData(0, 0, size, size);
  }
  alertIconCache = imageData;
  return imageData;
}

async function setAlertIcon(tabId) {
  if (alertTabs.has(tabId)) return;
  alertTabs.add(tabId);
  try {
    const imageData = await buildAlertIcons();
    await chrome.action.setIcon({ tabId, imageData });
  } catch {}
}

function resetTabIcon(tabId) {
  if (!alertTabs.delete(tabId)) return;
  try {
    chrome.action.setIcon({
      tabId,
      path: { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
    });
  } catch {}
}

// Reset icon when a tab navigates to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    resetTabIcon(tabId);
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  alertTabs.delete(tabId);
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      [KEYWORDS_KEY]: DEFAULT_KEYWORDS,
      [FINDINGS_KEY]: []
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "finding") {
    if (sender.tab?.id) setAlertIcon(sender.tab.id);
    enqueue(() => saveFinding(request.data)).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === "getKeywords") {
    getKeywords().then((keywords) => sendResponse({ keywords }));
    return true;
  }
  if (request.type === "getFindings") {
    getFindings().then((findings) => sendResponse({ findings }));
    return true;
  }
  if (request.type === "addKeyword") {
    enqueue(() => addKeyword(request.keyword)).then((result) => sendResponse(result));
    return true;
  }
  if (request.type === "removeKeyword") {
    enqueue(() => removeKeyword(request.keyword)).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === "removeFinding") {
    enqueue(() => removeFinding(request.findingId)).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === "clearFindings") {
    enqueue(() => clearFindings()).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (request.type === "exportFindings") {
    getFindings().then((findings) => sendResponse({ findings }));
    return true;
  }
});

async function getKeywords() {
  const result = await chrome.storage.local.get(KEYWORDS_KEY);
  return result[KEYWORDS_KEY] || DEFAULT_KEYWORDS;
}

async function addKeyword(keyword) {
  const keywords = await getKeywords();
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return { ok: false, error: "Keyword cannot be empty." };
  if (normalized.length > MAX_KEYWORD_LENGTH) return { ok: false, error: `Keyword must be ${MAX_KEYWORD_LENGTH} characters or fewer.` };
  if (keywords.length >= MAX_KEYWORDS) return { ok: false, error: `Maximum of ${MAX_KEYWORDS} keywords allowed.` };
  if (keywords.includes(normalized)) return { ok: false, error: "Keyword already exists." };
  keywords.push(normalized);
  await chrome.storage.local.set({ [KEYWORDS_KEY]: keywords });
  return { ok: true };
}

async function removeKeyword(keyword) {
  const keywords = await getKeywords();
  await chrome.storage.local.set({ [KEYWORDS_KEY]: keywords.filter((k) => k !== keyword) });
}

async function getFindings() {
  const result = await chrome.storage.local.get(FINDINGS_KEY);
  return result[FINDINGS_KEY] || [];
}

async function saveFinding(finding) {
  const findings = await getFindings();
  const isDuplicate = findings.some(
    (f) => f.url === finding.url && f.match === finding.match
  );
  if (isDuplicate) return;

  finding.id = crypto.randomUUID();
  findings.push(finding);

  // Evict oldest findings when cap is exceeded
  if (findings.length > MAX_FINDINGS) {
    findings.splice(0, findings.length - MAX_FINDINGS);
  }

  await chrome.storage.local.set({ [FINDINGS_KEY]: findings });

  const badgeCount = findings.length;
  chrome.action.setBadgeText({ text: badgeCount > 0 ? String(badgeCount) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#e74c3c" });
}

async function removeFinding(findingId) {
  const findings = await getFindings();
  const updated = findings.filter((f) => f.id !== findingId);
  await chrome.storage.local.set({ [FINDINGS_KEY]: updated });
  chrome.action.setBadgeText({ text: updated.length > 0 ? String(updated.length) : "" });
}

async function clearFindings() {
  await chrome.storage.local.set({ [FINDINGS_KEY]: [] });
  chrome.action.setBadgeText({ text: "" });
}
