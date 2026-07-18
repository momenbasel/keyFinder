let allFindings = [];
let firstRenderDone = false;

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const versionLabel = document.getElementById("versionLabel");
  if (versionLabel) versionLabel.textContent = "v" + chrome.runtime.getManifest().version;

  renderSkeleton();

  const response = await chrome.runtime.sendMessage({ type: "getFindings" });
  allFindings = response.findings || [];

  populateFilters();
  renderStats();
  renderFindings();
  renderTicker();
  firstRenderDone = true;

  document.getElementById("severityFilter").addEventListener("change", renderFindings);
  document.getElementById("typeFilter").addEventListener("change", renderFindings);
  document.getElementById("providerFilter").addEventListener("change", renderFindings);
  document.getElementById("searchBox").addEventListener("input", renderFindings);
  document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);
  document.getElementById("clearBtn").addEventListener("click", clearAll);

  const searchBox = document.getElementById("searchBox");
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    const typing = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
    if (e.key === "/" && !typing) {
      e.preventDefault();
      searchBox.focus();
    } else if (e.key === "Escape" && document.activeElement === searchBox) {
      searchBox.value = "";
      renderFindings();
      searchBox.blur();
    }
  });
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
  const duration = 400;
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

function renderSkeleton() {
  const tbody = document.getElementById("findingsBody");
  tbody.classList.remove("fresh");
  tbody.innerHTML = "";
  const widths = ["skl-w2", "skl-w1", "skl-w3", "skl-w4", "skl-w2", "skl-w3"];
  for (let i = 0; i < 6; i++) {
    const tr = document.createElement("tr");
    tr.className = "skl-row";
    const td = document.createElement("td");
    td.colSpan = 10;
    const bar = document.createElement("div");
    bar.className = "skl " + widths[i % widths.length];
    td.appendChild(bar);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function getFiltered() {
  const severity = document.getElementById("severityFilter").value;
  const type = document.getElementById("typeFilter").value;
  const provider = document.getElementById("providerFilter").value;
  const search = document.getElementById("searchBox").value.toLowerCase();

  return allFindings.filter((f) => {
    if (severity !== "all" && f.severity !== severity) return false;
    if (type !== "all" && f.type !== type) return false;
    if (provider !== "all" && f.provider !== provider) return false;
    if (search && !JSON.stringify(f).toLowerCase().includes(search)) return false;
    return true;
  });
}

function populateFilters() {
  const types = [...new Set(allFindings.map((f) => f.type))].sort();
  const providers = [...new Set(allFindings.map((f) => f.provider))].sort();

  const typeSelect = document.getElementById("typeFilter");
  for (const t of types) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  }

  const providerSelect = document.getElementById("providerFilter");
  for (const p of providers) {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    providerSelect.appendChild(opt);
  }
}

function renderStats() {
  const bar = document.getElementById("statsBar");
  const critical = allFindings.filter((f) => f.severity === "critical").length;
  const high = allFindings.filter((f) => f.severity === "high").length;
  const medium = allFindings.filter((f) => f.severity === "medium").length;
  const low = allFindings.filter((f) => f.severity === "low").length;
  const domains = new Set(allFindings.map((f) => f.domain)).size;

  bar.innerHTML = "";
  const stats = [
    { label: "Total", value: allFindings.length, cls: "stat-total", filter: "all" },
    { label: "Critical", value: critical, cls: "stat-critical", filter: "critical" },
    { label: "High", value: high, cls: "stat-high", filter: "high" },
    { label: "Medium", value: medium, cls: "stat-medium", filter: "medium" },
    { label: "Low", value: low, cls: "stat-low", filter: "low" },
    { label: "Domains", value: domains, cls: "stat-domains", filter: null },
  ];
  for (const s of stats) {
    const el = document.createElement("div");
    el.className = `stat-item ${s.cls}`;

    const top = document.createElement("span");
    top.className = "stat-top";
    const led = document.createElement("span");
    led.className = "stat-led";
    const lbl = document.createElement("span");
    lbl.className = "stat-lbl";
    lbl.textContent = s.label;
    top.appendChild(led);
    top.appendChild(lbl);

    const num = document.createElement("span");
    num.className = "stat-num";

    el.appendChild(top);
    el.appendChild(num);
    setNumber(num, s.value);

    if (s.filter) {
      el.dataset.filter = s.filter;
      el.title = s.filter === "all" ? "Show all severities" : `Filter: ${s.label.toLowerCase()} only`;
      el.addEventListener("click", () => {
        document.getElementById("severityFilter").value = s.filter;
        renderFindings();
      });
    }
    bar.appendChild(el);
  }
}

function syncStatActive() {
  const current = document.getElementById("severityFilter").value;
  document.querySelectorAll(".stat-item[data-filter]").forEach((el) => {
    el.classList.toggle("active", el.dataset.filter === current);
  });
}

function renderFindings() {
  const filtered = getFiltered();
  const tbody = document.getElementById("findingsBody");
  const empty = document.getElementById("emptyState");

  tbody.innerHTML = "";
  tbody.classList.toggle("fresh", !firstRenderDone && !REDUCE_MOTION);

  updateMeta(filtered.length);
  syncStatActive();

  if (filtered.length === 0) {
    const title = document.getElementById("emptyTitle");
    const copy = document.getElementById("emptyCopy");
    if (allFindings.length === 0) {
      title.textContent = "No findings yet";
      copy.textContent = "KeyFinder passively scans every page you visit. Browse around — leaked keys, tokens and credentials will surface here.";
    } else {
      title.textContent = "No matches in view";
      copy.textContent = "The current filters hide every finding. Adjust or clear them to bring results back.";
    }
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  filtered.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

  filtered.forEach((f, i) => {
    const sev = f.severity || "medium";
    const tr = document.createElement("tr");
    tr.className = "sev-" + sev;
    if (i < 30) tr.style.setProperty("--i", i);

    const tdNum = document.createElement("td");
    tdNum.textContent = String(i + 1).padStart(2, "0");
    tdNum.className = "td-num";

    const tdSev = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge badge-${sev}`;
    badge.textContent = sev.toUpperCase();
    tdSev.appendChild(badge);

    const tdProvider = document.createElement("td");
    tdProvider.textContent = f.provider || "-";
    tdProvider.className = "td-provider";

    const tdPattern = document.createElement("td");
    tdPattern.textContent = f.patternName || "-";
    tdPattern.className = "td-pattern";

    const tdMatch = document.createElement("td");
    const matchCode = document.createElement("code");
    matchCode.textContent = f.match || "-";
    matchCode.className = "match-value";
    matchCode.title = "click to copy\n" + (f.match || "");
    matchCode.addEventListener("click", () => {
      navigator.clipboard.writeText(f.match || "");
      flashCopied(copyBtn);
    });
    tdMatch.appendChild(matchCode);

    const tdType = document.createElement("td");
    const typeBadge = document.createElement("span");
    typeBadge.className = "type-badge";
    typeBadge.textContent = f.type || "-";
    tdType.appendChild(typeBadge);

    const tdDomain = document.createElement("td");
    tdDomain.textContent = f.domain || "-";
    tdDomain.className = "td-domain";

    const tdSource = document.createElement("td");
    tdSource.className = "td-source";
    if (f.url && f.url.startsWith("http")) {
      const a = document.createElement("a");
      a.href = f.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = truncateUrl(f.url, 30);
      a.title = f.url;
      tdSource.appendChild(a);
    } else {
      tdSource.textContent = f.url ? truncateUrl(f.url, 30) : "-";
    }

    const tdTime = document.createElement("td");
    tdTime.textContent = f.timestamp ? formatTime(f.timestamp) : "-";
    tdTime.className = "td-time";
    if (f.timestamp) tdTime.title = new Date(f.timestamp).toLocaleString();

    const tdActions = document.createElement("td");
    tdActions.className = "td-actions";
    const copyBtn = document.createElement("button");
    copyBtn.className = "btn-icon";
    copyBtn.textContent = "copy";
    copyBtn.title = "Copy match value";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(f.match || "");
      flashCopied(copyBtn);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-icon-danger";
    delBtn.textContent = "del";
    delBtn.title = "Remove finding";
    delBtn.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ type: "removeFinding", findingId: f.id });
      allFindings = allFindings.filter((x) => x.id !== f.id);
      renderStats();
      renderFindings();
      renderTicker();
    });

    tdActions.appendChild(copyBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdNum);
    tr.appendChild(tdSev);
    tr.appendChild(tdProvider);
    tr.appendChild(tdPattern);
    tr.appendChild(tdMatch);
    tr.appendChild(tdType);
    tr.appendChild(tdDomain);
    tr.appendChild(tdSource);
    tr.appendChild(tdTime);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

function flashCopied(btn) {
  if (!btn) return;
  btn.textContent = "copied";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = "copy";
    btn.classList.remove("copied");
  }, 1200);
}

function updateMeta(shown) {
  const metaLine = document.getElementById("metaLine");
  if (metaLine) {
    metaLine.innerHTML = "";
    metaLine.append(
      "showing ",
      strong(shown),
      " of ",
      strong(allFindings.length)
    );
  }
  const shellMeta = document.getElementById("shellMeta");
  if (shellMeta) shellMeta.textContent = shown + (shown === 1 ? " row" : " rows");
}

function strong(n) {
  const el = document.createElement("strong");
  el.textContent = n;
  return el;
}

function renderTicker() {
  const ticker = document.getElementById("ticker");
  const tickerText = document.getElementById("tickerText");
  if (!ticker || !tickerText) return;
  if (!allFindings.length) {
    ticker.hidden = true;
    return;
  }
  const latest = [...allFindings].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
  tickerText.innerHTML = "";
  const head = document.createElement("span");
  head.textContent = `${latest.provider || "unknown"} · ${latest.patternName || "match"} @ ${latest.domain || "—"} `;
  tickerText.appendChild(head);
  if (latest.match) {
    const code = document.createElement("code");
    code.textContent = truncateUrl(latest.match, 28);
    tickerText.appendChild(code);
  }
  ticker.hidden = false;
}

function truncateUrl(url, max) {
  if (url.length <= max) return url;
  return url.substring(0, max - 3) + "...";
}

function formatTime(ts) {
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const days = Math.floor(h / 24);
  if (days < 7) return days + "d ago";
  return d.toLocaleDateString();
}

function exportJson() {
  const filtered = getFiltered();
  const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
  downloadBlob(blob, `keyfinder-findings-${Date.now()}.json`);
}

function csvSafe(value) {
  let str = String(value || "");
  if (/^[=+\-@\t\r\n]/.test(str)) str = "'" + str;
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

function exportCsv() {
  const filtered = getFiltered();
  const headers = ["Severity", "Provider", "Pattern", "Match", "Type", "Domain", "URL", "Page URL", "Timestamp"];
  const rows = filtered.map((f) => [
    csvSafe(f.severity),
    csvSafe(f.provider),
    csvSafe(f.patternName),
    csvSafe(f.match),
    csvSafe(f.type),
    csvSafe(f.domain),
    csvSafe(f.url),
    csvSafe(f.pageUrl),
    csvSafe(f.timestamp ? new Date(f.timestamp).toISOString() : ""),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, `keyfinder-findings-${Date.now()}.csv`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function clearAll() {
  if (!confirm("Remove all findings?")) return;
  await chrome.runtime.sendMessage({ type: "clearFindings" });
  allFindings = [];
  renderStats();
  renderFindings();
  renderTicker();
}
