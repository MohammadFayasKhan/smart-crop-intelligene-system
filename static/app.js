/* ─────────────────────────────────────────────────────────────────────
   app.js  —  Smart Plant Intelligence System Dashboard
   Handles: sensor slider display, API calls, result rendering,
            history chart, auto-update loop, IoT live feed polling.

   Rain sensor note:
     The YL-83 outputs a binary digital signal (1 = rain, 0 = no rain).
     There is no rainfall in mm. All rain logic uses this binary value.
───────────────────────────────────────────────────────────────────── */

"use strict";

// ── Constants ──────────────────────────────────────────────────────
const API_BASE        = "";        // same host — FastAPI serves both
const AUTO_INTERVAL   = 8000;      // ms between auto-predictions
const IOT_POLL_MS     = 10000;     // poll /latest every 10s
const MAX_HISTORY     = 20;

// ── Crop emoji map ─────────────────────────────────────────────────
const CROP_EMOJIS = {
  rice         : "🍚", maize         : "🌽", chickpea     : "🫘",
  kidneybeans  : "🫘", pigeonpeas    : "🫘", mothbeans    : "🌿",
  mungbean     : "🌱", blackgram     : "🌿", lentil       : "🌿",
  pomegranate  : "🍎", banana        : "🍌", mango        : "🥭",
  grapes       : "🍇", watermelon    : "🍉", muskmelon    : "🍈",
  apple        : "🍏", orange        : "🍊", papaya       : "🍈",
  coconut      : "🥥", cotton        : "🌾", jute         : "🌿",
  coffee       : "☕",
};

const SEVERITY_ICONS = {
  CRITICAL: "🔴",
  HIGH    : "🟠",
  MODERATE: "🟡",
  WATCH   : "🔵",
};

const SEVERITY_COLORS = {
  CRITICAL: "#ef233c",
  HIGH    : "#ff6b35",
  MODERATE: "#ffd166",
  WATCH   : "#4cc9f0",
};

// ── Preset scenarios (rain = 1 or 0) ──────────────────────────────
const PRESETS = {
  monsoon: { temperature: 30, humidity: 85, soil_moisture: 70, rain: 1 },
  summer : { temperature: 42, humidity: 25, soil_moisture: 15, rain: 0 },
  foggy  : { temperature: 16, humidity: 93, soil_moisture: 60, rain: 1 },
  ideal  : { temperature: 25, humidity: 65, soil_moisture: 50, rain: 0 },
};

// ── State ──────────────────────────────────────────────────────────
let autoTimer     = null;
let iotTimer      = null;
let historyChart  = null;
let chartLabels   = [];
let chartTemp     = [];
let chartHumidity = [];
let chartRainBin  = [];           // 0 / 1 values
let lastIotTs     = null;
let rainState     = 0;            // current binary rain value (0 = dry, 1 = raining)

// ── Init ───────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initSliderDisplays();
  initChart();
  checkServerHealth();
  startAutoUpdate();
  startIotPoll();

  document.getElementById("autoToggle").addEventListener("change", (e) => {
    if (e.target.checked) startAutoUpdate();
    else                   stopAutoUpdate();
  });
});

// ── Slider display init ────────────────────────────────────────────
function initSliderDisplays() {
  ["temperature", "humidity", "soil_moisture"].forEach(id => {
    const el = document.getElementById(id);
    if (el) updateDisplay(id, el.value);
  });
  // Initialize rain toggle visual
  setRainToggle(rainState);
}

function updateDisplay(id, value) {
  const el = document.getElementById("val-" + id);
  if (el) el.textContent = parseFloat(value).toFixed(1);
  colourCard(id, parseFloat(value));
}

function colourCard(id, value) {
  const cardMap = {
    temperature  : "temp",
    humidity     : "humidity",
    soil_moisture: "soil",
  };
  const card = document.getElementById("card-" + cardMap[id]);
  if (!card) return;
  card.style.borderColor = "";
  if (id === "temperature"   && value > 38) card.style.borderColor = "#ef233c";
  if (id === "humidity"      && value > 85) card.style.borderColor = "#f72585";
  if (id === "soil_moisture" && value > 85) card.style.borderColor = "#ff6b35";
}

// ── Rain Toggle ────────────────────────────────────────────────────
// The YL-83 only outputs 0 or 1. This button mirrors that binary state.
function toggleRain() {
  rainState = rainState === 0 ? 1 : 0;
  setRainToggle(rainState);
  runPrediction(true);   // silent — just update results
}

function setRainToggle(val) {
  rainState = val;
  const btn   = document.getElementById("rainToggle");
  const icon  = document.getElementById("rainIcon");
  const label = document.getElementById("rainLabel");
  const card  = document.getElementById("card-rain");
  if (!btn) return;

  if (val === 1) {
    icon.textContent  = "🌧️";
    label.textContent = "RAINING";
    btn.classList.add("rain-on");
    btn.classList.remove("rain-off");
    btn.setAttribute("aria-pressed", "true");
    if (card) card.style.borderColor = "#4cc9f0";
  } else {
    icon.textContent  = "☀️";
    label.textContent = "NO RAIN";
    btn.classList.add("rain-off");
    btn.classList.remove("rain-on");
    btn.setAttribute("aria-pressed", "false");
    if (card) card.style.borderColor = "";
  }
}

// ── Presets ────────────────────────────────────────────────────────
function loadPreset(name) {
  const p = PRESETS[name];
  if (!p) return;

  // Update sliders
  ["temperature", "humidity", "soil_moisture"].forEach(id => {
    const el = document.getElementById(id);
    if (el && p[id] !== undefined) { el.value = p[id]; updateDisplay(id, p[id]); }
  });

  // Update rain toggle
  setRainToggle(p.rain ?? 0);

  runPrediction();
}

// ── Collect sensor payload ─────────────────────────────────────────
function collectPayload() {
  const get = id => parseFloat(document.getElementById(id)?.value || 0);
  return {
    temperature  : get("temperature"),
    humidity     : get("humidity"),
    soil_moisture: get("soil_moisture"),
    rain         : rainState,           // binary 0 or 1
  };
}

// ── Prediction call ────────────────────────────────────────────────
async function runPrediction(silent = false) {
  if (!silent) showLoading(true);
  try {
    const payload = collectPayload();
    const res     = await fetch(`${API_BASE}/predict`, {
      method : "POST",
      headers: {
        "Content-Type"              : "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();
    renderRecommendation(data);
    renderDiseaseAlerts(data);
    renderFeatures(data.features);
    updateChart(data);
    setLastUpdated(data.timestamp);
  } catch (err) {
    console.error("Prediction error:", err);
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

// ── Server health ──────────────────────────────────────────────────
async function checkServerHealth() {
  try {
    const res  = await fetch(`${API_BASE}/health`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = await res.json();
    setServerStatus(data.status === "online");
  } catch {
    setServerStatus(false);
  }
}

function setServerStatus(online) {
  const dot  = document.getElementById("badgeDot");
  const text = document.getElementById("badgeText");
  dot.className    = "badge-dot " + (online ? "online" : "offline");
  text.textContent = online ? "Server Online" : "Server Offline";
}

// ── Render crop recommendation ─────────────────────────────────────
function renderRecommendation(data) {
  const crop  = data.recommended_crop;
  const conf  = data.confidence;
  const top3  = data.top3 || [];
  const emoji = CROP_EMOJIS[crop?.toLowerCase()] || "🌱";
  const deg   = Math.round((conf / 100) * 360);

  document.getElementById("recommendationContent").innerHTML = `
    <div class="crop-result">
      <div class="crop-main-card">
        <div class="crop-emoji">${emoji}</div>
        <div class="crop-info">
          <div class="crop-name">${cap(crop)}</div>
          <div class="crop-confidence-text">Confidence: ${conf}%</div>
        </div>
        <div class="confidence-ring-wrap">
          <div class="confidence-ring"
               style="background: conic-gradient(#57cc99 ${deg}deg, #1a4a1a ${deg}deg)">
            <span class="confidence-pct">${conf}%</span>
          </div>
        </div>
      </div>
      <div class="top3-label">Top 3 Alternatives</div>
      <div class="top3-list">
        ${top3.map((item, i) => `
          <div class="top3-item">
            <span class="top3-rank">${["🥇","🥈","🥉"][i]}</span>
            <span class="top3-crop">${cap(item.crop)}</span>
            <div class="top3-bar-wrap">
              <div class="top3-bar" style="width:${item.confidence}%"></div>
            </div>
            <span class="top3-conf">${item.confidence}%</span>
          </div>
        `).join("")}
      </div>
    </div>`;
}

// ── Render disease alerts ──────────────────────────────────────────
function renderDiseaseAlerts(data) {
  const panel  = document.getElementById("diseaseContent");
  const badge  = document.getElementById("alertCountBadge");
  const alerts = data.disease_alerts || [];

  badge.textContent = alerts.length;
  badge.style.display = alerts.length > 0 ? "inline-block" : "none";

  if (alerts.length === 0) {
    panel.innerHTML = `
      <div class="all-clear">
        <span class="all-clear-icon">✅</span>
        All Clear — No disease risk conditions detected.
        Current sensor readings are within safe ranges.
      </div>`;
    return;
  }

  panel.innerHTML = alerts.map((d, i) => {
    const color = SEVERITY_COLORS[d.severity] || "#aaa";
    const icon  = SEVERITY_ICONS[d.severity]  || "⚪";
    return `
      <div class="disease-card" style="border-left-color:${color}">
        <div class="disease-card-header" onclick="toggleDisease(${i})">
          <span class="disease-severity-icon">${icon}</span>
          <span class="disease-name">${d.name}</span>
          <span class="disease-type-badge">${d.type}</span>
          <span class="disease-severity-label" style="color:${color}">${d.severity}</span>
        </div>
        <div class="disease-body" id="disease-body-${i}">
          <div class="disease-field"><strong>🎯 Trigger</strong><p>${d.trigger}</p></div>
          <div class="disease-field"><strong>🔍 Symptoms</strong><p>${d.symptoms}</p></div>
          <div class="disease-field"><strong>💊 Treatment</strong><p>${d.pesticide}</p></div>
          <div class="disease-field"><strong>🌿 Technique</strong><p>${d.technique}</p></div>
        </div>
      </div>`;
  }).join("");

  // Auto-expand CRITICAL alerts
  alerts.forEach((d, i) => {
    if (d.severity === "CRITICAL") {
      document.getElementById(`disease-body-${i}`)?.classList.add("open");
    }
  });
}

function toggleDisease(i) {
  document.getElementById(`disease-body-${i}`)?.classList.toggle("open");
}

// ── Render risk flags ──────────────────────────────────────────────
function renderFeatures(features) {
  if (!features) return;
  const flags = {
    "feat-fungal_risk"  : features.fungal_risk,
    "feat-drought_risk" : features.drought_risk,
    "feat-waterlog_risk": features.waterlog_risk,
  };
  Object.entries(flags).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val ? "⚠️ YES" : "✅ NO";
    el.className   = "feature-val " + (val ? "flag-on" : "flag-off");
  });
}

// ── Chart ──────────────────────────────────────────────────────────
function initChart() {
  const ctx = document.getElementById("historyChart")?.getContext("2d");
  if (!ctx) return;

  Chart.defaults.color       = "#4a6b4a";
  Chart.defaults.borderColor = "rgba(82,183,136,0.1)";

  historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels  : [],
      datasets: [
        {
          label          : "Temperature (°C)",
          data           : [],
          borderColor    : "#ff6b35",
          backgroundColor: "rgba(255,107,53,0.08)",
          tension        : 0.4,
          fill           : true,
          pointRadius    : 3,
          borderWidth    : 2,
          yAxisID        : "yLeft",
        },
        {
          label          : "Humidity (%)",
          data           : [],
          borderColor    : "#4cc9f0",
          backgroundColor: "rgba(76,201,240,0.08)",
          tension        : 0.4,
          fill           : true,
          pointRadius    : 3,
          borderWidth    : 2,
          yAxisID        : "yLeft",
        },
        {
          label          : "Rain (0=Dry / 1=Rain)",
          data           : [],
          borderColor    : "#52b788",
          backgroundColor: "rgba(82,183,136,0.25)",
          tension        : 0,            // step-line looks best for binary
          fill           : true,
          pointRadius    : 4,
          pointStyle     : "rectRounded",
          borderWidth    : 2,
          stepped        : true,         // step-line for binary toggle
          yAxisID        : "yRight",
        },
      ],
    },
    options: {
      responsive         : true,
      maintainAspectRatio: false,
      interaction        : { mode: "index", intersect: false },
      plugins: {
        legend : { labels: { color: "#8aab8a", font: { size: 11 }, boxWidth: 12 } },
        tooltip: { backgroundColor: "#0d1a0d", borderColor: "rgba(82,183,136,0.3)", borderWidth: 1 },
      },
      scales: {
        x      : { ticks: { color: "#4a6b4a", font: { size: 10 }, maxTicksLimit: 10 }, grid: { color: "rgba(82,183,136,0.06)" } },
        yLeft  : { type: "linear", position: "left",  ticks: { color: "#4a6b4a", font: { size: 10 } }, grid: { color: "rgba(82,183,136,0.06)" } },
        yRight : { type: "linear", position: "right", min: -0.1, max: 1.5,
                   ticks: { color: "#52b788", font: { size: 10 }, callback: v => v === 0 ? "Dry" : v === 1 ? "Rain" : "" },
                   grid: { drawOnChartArea: false } },
      },
      animation: { duration: 400 },
    },
  });
}

function updateChart(data) {
  if (!historyChart || !data.features) return;

  const label = new Date(data.timestamp).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  chartLabels.push(label);
  chartTemp.push(data.features.temperature);
  chartHumidity.push(data.features.humidity);
  chartRainBin.push(data.features.rain ?? 0);   // binary 0 or 1

  if (chartLabels.length > MAX_HISTORY) {
    chartLabels.shift(); chartTemp.shift(); chartHumidity.shift(); chartRainBin.shift();
  }

  historyChart.data.labels           = [...chartLabels];
  historyChart.data.datasets[0].data = [...chartTemp];
  historyChart.data.datasets[1].data = [...chartHumidity];
  historyChart.data.datasets[2].data = [...chartRainBin];
  historyChart.update("none");
}

// ── Auto-update loop ───────────────────────────────────────────────
function startAutoUpdate() {
  stopAutoUpdate();
  runPrediction(true);              // silent on first auto-load
  autoTimer = setInterval(() => runPrediction(true), AUTO_INTERVAL);
}

function stopAutoUpdate() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

// ── IoT Live Feed ──────────────────────────────────────────────────
function startIotPoll() {
  pollIoT();
  iotTimer = setInterval(pollIoT, IOT_POLL_MS);
}

async function pollIoT() {
  try {
    const res = await fetch(`${API_BASE}/latest`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    });

    if (res.status === 404) {
      setIotBar(false, "Waiting for ESP8266...", null);
      return;
    }
    if (!res.ok) return;

    const d = await res.json();

    // Always update the live values bar
    const ago = Math.round((Date.now() - new Date(d.timestamp)) / 1000);
    setIotBar(true, "📡 ESP8266 connected", d, ago);

    // Only sync controls + run prediction on NEW reading
    if (d.timestamp === lastIotTs) return;
    lastIotTs = d.timestamp;

    // Sync sliders
    ["temperature", "humidity", "soil_moisture"].forEach(id => {
      const el = document.getElementById(id);
      if (el && d[id] !== undefined) { el.value = d[id]; updateDisplay(id, d[id]); }
    });

    // Sync rain toggle from ESP8266 binary output
    if (d.rain !== undefined) setRainToggle(d.rain);

    // Trigger prediction silently — no loading overlay
    await runPrediction(true);

  } catch (err) {
    console.warn("IoT poll error:", err.message);
    setIotBar(false, "ESP8266 not reachable", null);
  }
}

function setIotBar(online, statusText, data, ago) {
  const bar    = document.getElementById("iotFeedBar");
  const dot    = document.getElementById("iotDot");
  const text   = document.getElementById("iotFeedText");
  const vals   = document.getElementById("iotLiveValues");
  const agoEl  = document.getElementById("iotAgo");
  const acChip = document.getElementById("iot-alerts-chip");

  if (!bar) return;

  bar.className    = "iot-feed-bar " + (online ? "iot-online" : "iot-offline");
  dot.className    = "iot-dot "      + (online ? "iot-dot-on" : "iot-dot-off");
  text.textContent = statusText;

  if (online && data) {
    vals.style.display = "flex";
    document.getElementById("iot-t").textContent = data.temperature;
    document.getElementById("iot-h").textContent = data.humidity;
    document.getElementById("iot-s").textContent = data.soil_moisture;

    // Show binary rain status (not mm)
    const rainEl   = document.getElementById("iot-r");
    const rainChip = document.getElementById("iot-rain-chip");
    if (rainEl) {
      const isRaining = data.rain === 1;
      rainEl.textContent  = isRaining ? "RAIN" : "DRY";
      if (rainChip) {
        rainChip.style.background    = isRaining ? "rgba(76,201,240,0.15)" : "rgba(82,183,136,0.1)";
        rainChip.style.borderColor   = isRaining ? "rgba(76,201,240,0.4)"  : "rgba(82,183,136,0.25)";
      }
    }

    if (data.alert_count > 0) {
      acChip.style.display = "inline-flex";
      document.getElementById("iot-ac").textContent = data.alert_count;
    } else {
      acChip.style.display = "none";
    }

    if (agoEl && ago !== undefined) {
      agoEl.textContent = ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`;
    }
  } else {
    vals.style.display = "none";
  }
}

// ── UI utilities ───────────────────────────────────────────────────
function showLoading(visible) {
  document.getElementById("loadingOverlay")?.classList.toggle("visible", visible);
}

function setLastUpdated(isoStr) {
  const el = document.getElementById("lastUpdated");
  if (!el) return;
  try { el.textContent = "Updated " + new Date(isoStr).toLocaleTimeString(); }
  catch { el.textContent = "Updated just now"; }
}

function showError(msg) {
  ["recommendationContent", "diseaseContent"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `
      <div class="placeholder-state">
        <div class="placeholder-icon">⚠️</div>
        <p style="color:#ef233c">Error: ${msg}</p>
        <p style="font-size:11px;margin-top:6px">Make sure the FastAPI server is running.</p>
      </div>`;
  });
  setServerStatus(false);
}

function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
