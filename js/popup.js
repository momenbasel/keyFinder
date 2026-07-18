document.addEventListener("DOMContentLoaded", init);

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lastKeywords = 0;
let lastFindings = 0;
let termBooted = false;

async function init() {
  const versionLabel = document.getElementById("versionLabel");
  if (versionLabel) versionLabel.textContent = "v" + chrome.runtime.getManifest().version;
  await renderKeywords();
  await renderStats();
  updateTermLine(true);
  termBooted = true;
  document.getElementById("keywordForm").addEventListener("submit", handleAddKeyword);
}

/* eased count-up for stat numerals */
function setNumber(el, target) {
  if (!el) return;
  const from = parseInt(el.textContent, 10);
  const start = Number.isFinite(from) ? from : 0;
  if (REDUCE_MOTION || start === target) {
    el.textContent = target;
    return;
  }
  const duration = 380;
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* terminal status line — types once per popup open, instant after */
function updateTermLine(typed) {
  const el = document.getElementById("termText");
  if (!el) return;
  const text = `kf> scan armed :: ${lastKeywords} keywords :: ${lastFindings} findings`;
  if (!typed || REDUCE_MOTION) {
    el.textContent = text;
    return;
  }
  let i = 0;
  (function type() {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, 14);
  })();
}

async function renderKeywords() {
  const response = await chrome.runtime.sendMessage({ type: "getKeywords" });
  const keywords = response.keywords || [];
  const list = document.getElementById("keywordList");
  list.innerHTML = "";

  lastKeywords = keywords.length;
  setNumber(document.getElementById("keywordCount"), keywords.length);
  if (termBooted) updateTermLine(false);

  if (keywords.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "no keywords configured";
    list.appendChild(empty);
    return;
  }

  for (const kw of keywords) {
    const li = document.createElement("li");
    li.className = "keyword-item";

    const label = document.createElement("span");
    label.className = "keyword-label";
    label.textContent = kw;

    const removeBtn = document.createElement("button");
    removeBtn.className = "keyword-remove";
    removeBtn.textContent = "×";
    removeBtn.title = `Remove "${kw}"`;
    removeBtn.addEventListener("click", () => handleRemoveKeyword(kw));

    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  }
}

async function renderStats() {
  const response = await chrome.runtime.sendMessage({ type: "getFindings" });
  const findings = response.findings || [];
  lastFindings = findings.length;
  setNumber(document.getElementById("findingCount"), findings.length);
  if (termBooted) updateTermLine(false);
}

async function handleAddKeyword(e) {
  e.preventDefault();
  const input = document.getElementById("keywordInput");
  const errorMsg = document.getElementById("errorMsg");
  const keyword = input.value.trim();

  errorMsg.hidden = true;

  if (!keyword) {
    showError("Keyword cannot be empty.");
    return;
  }

  const result = await chrome.runtime.sendMessage({ type: "addKeyword", keyword });

  if (!result.ok) {
    showError(result.error);
    return;
  }

  input.value = "";
  input.focus();
  await renderKeywords();
}

async function handleRemoveKeyword(keyword) {
  await chrome.runtime.sendMessage({ type: "removeKeyword", keyword });
  await renderKeywords();
}

function showError(msg) {
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
  setTimeout(() => { errorMsg.hidden = true; }, 3000);
}
