---
title: Smart Plant Intelligence System
emoji: 🌿
colorFrom: green
colorTo: indigo
sdk: docker
pinned: true
license: mit
short_description: IoT crop recommendation and disease detection powered by ML
---

<div align="center">

# 🌿 Smart Plant Intelligence System

### IoT-Driven Crop Recommendation & Disease Risk Detection

[![HF Space](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Space-blue)](https://huggingface.co/spaces/Fayasx/smart-plant)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A complete end-to-end IoT + Machine Learning system that reads live sensor data from an ESP8266 microcontroller, predicts the best crop to grow, and detects real-time disease risk conditions — all accessible from a beautiful web dashboard.**

[Live Demo](https://Fayasx-smart-plant.hf.space) · [Report Bug](https://github.com/MohammadFayasKhan/smart-crop-intelligene-system/issues) · [Request Feature](https://github.com/MohammadFayasKhan/smart-crop-intelligene-system/issues)

</div>

---

## 📸 Dashboard Preview

The dashboard features a glassmorphic dark theme with real-time sensor cards, crop recommendations with confidence rings, expandable disease alerts, risk analysis flags, and a live sensor history chart.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESP8266 NodeMCU                             │
│  ┌─────────┐  ┌─────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  DHT11  │  │ Soil Sensor │  │ YL-83 Rain│  │ 16x2 LCD   │  │
│  │ Temp+Hum│  │  (Analog)   │  │ (Digital) │  │  (I2C)     │  │
│  └────┬────┘  └──────┬──────┘  └─────┬─────┘  └─────┬──────┘  │
│       └──────────────┼───────────────┘               │         │
│                      ▼                               │         │
│             POST /predict/compact ───────────────────┘         │
│                (HTTPS to Cloud)                                │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Hugging Face Spaces (Docker)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 FastAPI Backend                       │      │
│  │                                                      │      │
│  │  /predict        → Full ML pipeline + disease engine │      │
│  │  /predict/compact→ Compact response for ESP8266 LCD  │      │
│  │  /latest         → Last IoT reading (polled by UI)   │      │
│  │  /health         → Server status check               │      │
│  │  /history        → Last 50 sensor readings           │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌────────────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │ crop_model.pkl │  │ scaler.pkl │  │ label_encoder.pkl│      │
│  │  (Random Forest│  │ (Standard  │  │  (22 crop       │      │
│  │   Classifier)  │  │  Scaler)   │  │   classes)      │      │
│  └────────────────┘  └────────────┘  └──────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Web Dashboard (static/)                  │      │
│  │  index.html + style.css + app.js                     │      │
│  │  • Live IoT feed bar with real-time chip updates     │      │
│  │  • Crop prediction with confidence ring              │      │
│  │  • Disease alerts (expandable cards)                 │      │
│  │  • Sensor history chart (Chart.js)                   │      │
│  │  • Auto-update every 8 seconds                       │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 Machine Learning Pipeline
- **Random Forest Classifier** trained on the [Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) (2200 samples, 22 crop classes)
- **3-feature model**: Temperature, Humidity, Rainfall (binary rain mapped to representative mm values)
- **Top 3 alternative crops** with confidence percentages
- **StandardScaler** for feature normalization

### 🦠 Disease Risk Engine
- **18 agricultural diseases** with science-based trigger conditions
- Covers **Fungal**, **Bacterial**, **Viral**, and **Abiotic** stress types
- Each alert includes → **Trigger**, **Symptoms**, **Pesticide/Treatment**, **Farming Technique**
- 4-tier severity system → `CRITICAL` · `HIGH` · `MODERATE` · `WATCH`

### 📡 IoT Hardware Integration
- **ESP8266 NodeMCU** with WiFi → posts sensor data every 15 seconds
- **DHT11** → Temperature (°C) + Humidity (%)
- **Soil Moisture Sensor** → Analog reading mapped to 0-100%
- **YL-83 Rain Sensor** → Binary digital output (1 = rain, 0 = dry)
- **16x2 LCD (I2C)** → Shows crop recommendation, disease alerts, and sensor readings locally

### 🖥️ Dashboard
- **Glassmorphic dark theme** with green accent palette
- **Real-time live sensor feed bar** with scanning shimmer animation
- **IoT chip flash** → chips glow when new data arrives
- **Value flash** → sensor numbers pulse white-to-green on update
- **Live "ago" ticker** → updates every second (never shows stale time)
- **Auto-update toggle** → silent background predictions every 8 seconds
- **Preset scenarios** → Monsoon, Hot Summer, Foggy Cold, Ideal
- **Binary rain toggle button** → mirrors the physical YL-83 sensor's digital output
- **Fully responsive** → works on desktop, tablet, and mobile

### ☁️ Deployment
- **Hugging Face Spaces** (Docker) → always-on, free tier
- **3 firmware modes** → Local (same WiFi), ngrok (tunnel), Cloud (HF Spaces)
- **CORS enabled** → ESP8266 and any external browser can call the API
- No Mac/laptop required to run once deployed

---

## 🔌 Hardware Wiring

| ESP8266 Pin | Component | Connection |
|---|---|---|
| `D4` (GPIO2) | DHT11 | DATA (middle pin) |
| `A0` (ADC) | Soil Moisture | AO (analog output) |
| `D5` (GPIO14) | YL-83 Rain | DO (digital output) |
| `D1` (GPIO5) | LCD HW-61 | SCL |
| `D2` (GPIO4) | LCD HW-61 | SDA |
| `3.3V` | DHT11, Soil, Rain | VCC |
| `VIN` (5V) | LCD HW-61 | VCC (LCD needs 5V) |
| `GND` | All sensors | GND |

---

## 📂 Project Structure

```
Smart_Crop_Intelligence_System/
├── main.py                    # FastAPI backend (endpoints, CORS, routing)
├── predict.py                 # ML inference pipeline (load model, predict, top3)
├── disease_engine.py          # 18-disease risk detection with binary rain logic
├── crop_model.pkl             # Trained Random Forest model (~19 MB)
├── scaler.pkl                 # StandardScaler fitted on training data
├── label_encoder.pkl          # LabelEncoder for 22 crop classes
├── feature_names.pkl          # Feature name ordering for the scaler
├── requirements.txt           # Python dependencies (pinned scikit-learn)
├── Dockerfile                 # HF Spaces Docker config (port 7860)
├── start.sh                   # Local dev startup script
├── esp8266_firmware.ino       # Complete Arduino firmware (3 modes)
├── Crop_Recommendation.csv    # Training dataset
├── SmartCropIntelligenceSystem.ipynb  # Jupyter notebook (full ML pipeline)
└── static/
    ├── index.html             # Dashboard HTML
    ├── style.css              # Glassmorphic dark theme CSS
    └── app.js                 # Dashboard logic (IoT polling, chart, animations)
```

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/MohammadFayasKhan/smart-crop-intelligene-system.git
cd smart-crop-intelligene-system

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Open `http://localhost:8000` in your browser.

### Cloud Deployment (Hugging Face Spaces)

1. Create a new Space on [huggingface.co/new-space](https://huggingface.co/new-space) → SDK: **Docker**
2. Clone and push:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/smart-plant
cp -r Smart_Crop_Intelligence_System/* smart-plant/
cd smart-plant && git add . && git commit -m "deploy" && git push
```
3. Wait for build → your dashboard is live at `https://YOUR_USERNAME-smart-plant.hf.space`

### ESP8266 Firmware

1. Open `esp8266_firmware.ino` in Arduino IDE
2. Set your WiFi credentials and deployment mode:
```cpp
const char* WIFI_SSID = "YourWiFi";
const char* WIFI_PASS = "YourPassword";

#define USE_CLOUD true    // or false for local
const char* HF_SPACE_URL = "https://YOUR_USERNAME-smart-plant.hf.space";
```
3. Upload to ESP8266 → LCD shows "HF Cloud" → data flows to dashboard

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the web dashboard |
| `GET` | `/health` | Server status check |
| `POST` | `/predict` | Full ML prediction + disease alerts |
| `POST` | `/predict/compact` | Compact response for ESP8266 LCD |
| `GET` | `/latest` | Most recent IoT reading |
| `GET` | `/history?limit=20` | Last N sensor readings |

### Request Body (`/predict`)
```json
{
  "temperature": 28,
  "humidity": 75,
  "soil_moisture": 45,
  "rain": 1
}
```

---

## 🧪 ML Pipeline Details

| Stage | Details |
|---|---|
| **Dataset** | 2200 samples × 22 crops × 7 features |
| **Features Used** | Temperature, Humidity, Rainfall (binary → mm mapped) |
| **Model** | Random Forest Classifier (scikit-learn 1.4.2) |
| **Split** | 80/20 stratified train-test |
| **Preprocessing** | StandardScaler (fit on training data only) |
| **Rain Mapping** | `rain=1` → `120mm`, `rain=0` → `20mm` (for model compatibility) |

---

## 🛠️ Technologies

| Layer | Stack |
|---|---|
| **Hardware** | ESP8266, DHT11, Soil Sensor, YL-83, 16x2 LCD (I2C) |
| **Firmware** | Arduino C++ (ESP8266WiFi, ArduinoJson, BearSSL) |
| **Backend** | Python 3.9, FastAPI, Uvicorn, scikit-learn, joblib |
| **Frontend** | HTML5, CSS3 (glassmorphic), vanilla JavaScript, Chart.js |
| **Deployment** | Docker, Hugging Face Spaces (CPU Basic, free tier) |

---

## 👤 Author

**Mohammad Fayas Khan**

- GitHub: [@MohammadFayasKhan](https://github.com/MohammadFayasKhan)
- Hugging Face: [@Fayasx](https://huggingface.co/Fayasx)

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 🌱 for smarter farming**

</div>
