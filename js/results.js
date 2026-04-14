let allFindings = [];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const response = await chrome.runtime.sendMessage({ type: "getFindings" });
  allFindings = response.findings || [];

  populateFilters();
  renderStats();
  renderFindings();

  document.getElementById("severityFilter").addEventListener("change", renderFindings);
  document.getElementById("typeFilter").addEventListener("change", renderFindings);
  document.getElementById("providerFilter").addEventListener("change", renderFindings);
  document.getElementById("searchBox").addEventListener("input", renderFindings);
  document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);
  document.getElementById("clearBtn").addEventListener("click", clearAll);
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
    { label: "Total", value: allFindings.length, cls: "stat-total" },
    { label: "Critical", value: critical, cls: "stat-critical" },
    { label: "High", value: high, cls: "stat-high" },
    { label: "Medium", value: medium, cls: "stat-medium" },
    { label: "Low", value: low, cls: "stat-low" },
    { label: "Domains", value: domains, cls: "stat-domains" },
  ];
  for (const s of stats) {
    const el = document.createElement("div");
    el.className = `stat-item ${s.cls}`;
    const num = document.createElement("span");
    num.className = "stat-num";
    num.textContent = s.value;
    const lbl = document.createElement("span");
    lbl.className = "stat-lbl";
    lbl.textContent = s.label;
    el.appendChild(num);
    el.appendChild(lbl);
    bar.appendChild(el);
  }
}

function renderFindings() {
  const filtered = getFiltered();
  const tbody = document.getElementById("findingsBody");
  const empty = document.getElementById("emptyState");

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  filtered.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));

  filtered.forEach((f, i) => {
    const tr = document.createElement("tr");

    const tdNum = document.createElement("td");
    tdNum.textContent = i + 1;

    const tdSev = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge badge-${f.severity || "medium"}`;
    badge.textContent = (f.severity || "medium").toUpperCase();
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
    matchCode.title = f.match || "";
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
    if (f.url && f.url.startsWith("http")) {
      const a = document.createElement("a");
      a.href = f.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = truncateUrl(f.url, 40);
      a.title = f.url;
      tdSource.appendChild(a);
    } else {
      tdSource.textContent = f.url ? truncateUrl(f.url, 40) : "-";
    }

    const tdTime = document.createElement("td");
    tdTime.textContent = f.timestamp ? formatTime(f.timestamp) : "-";
    tdTime.className = "td-time";

    const tdActions = document.createElement("td");
    const copyBtn = document.createElement("button");
    copyBtn.className = "btn-icon";
    copyBtn.textContent = "Copy";
    copyBtn.title = "Copy match value";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(f.match || "");
      copyBtn.textContent = "Done";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-icon-danger";
    delBtn.textContent = "Del";
    delBtn.title = "Remove finding";
    delBtn.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ type: "removeFinding", findingId: f.id });
      allFindings = allFindings.filter((x) => x.id !== f.id);
      renderStats();
      renderFindings();
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

function truncateUrl(url, max) {
  if (url.length <= max) return url;
  return url.substring(0, max - 3) + "...";
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function exportJson() {
  const filtered = getFiltered();
  const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
  downloadBlob(blob, `keyfinder-findings-${Date.now()}.json`);
}

function csvSafe(value) {
  let str = String(value || "");
  if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
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
}
