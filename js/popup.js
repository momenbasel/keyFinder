document.addEventListener("DOMContentLoaded", init);

async function init() {
  const versionLabel = document.getElementById("versionLabel");
  if (versionLabel) versionLabel.textContent = "v" + chrome.runtime.getManifest().version;
  await renderKeywords();
  await renderStats();
  document.getElementById("keywordForm").addEventListener("submit", handleAddKeyword);
}

async function renderKeywords() {
  const response = await chrome.runtime.sendMessage({ type: "getKeywords" });
  const keywords = response.keywords || [];
  const list = document.getElementById("keywordList");
  list.innerHTML = "";

  document.getElementById("keywordCount").textContent = keywords.length;

  if (keywords.length === 0) {
    list.innerHTML = '<li class="empty-state">No keywords configured</li>';
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
    removeBtn.textContent = "\u00D7";
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
  document.getElementById("findingCount").textContent = findings.length;
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
