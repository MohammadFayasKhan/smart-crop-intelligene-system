---
title: Smart Plant Intelligence System
emoji: 🌿
colorFrom: green
colorTo: indigo
sdk: docker
app_port: 7860
pinned: true
license: mit
short_description: IoT crop recommendation and disease detection powered by ML
---

<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/1892/1892751.png" alt="Smart Plant System Logo" width="120" />
  <h1>🌿 SMART PLANT INTELLIGENCE SYSTEM</h1>
  <p><strong>IoT-Driven Crop Recommendation & Disease Risk Detection Engine</strong></p>
  <p>An end-to-end production-grade ecosystem bridging edge IoT devices directly to cloud-hosted Machine Learning inference.</p>

  <p>
    <a href="https://huggingface.co/spaces/Fayasx/smart-plant" target="_blank">
      <img src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-App_Live-FFD21E?style=for-the-badge&logoColor=black" alt="Hugging Face Space Live" />
    </a>
    <img src="https://img.shields.io/badge/Python_3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-learn" />
    <img src="https://img.shields.io/badge/ESP8266-000000?style=for-the-badge&logo=espressif&logoColor=white" alt="ESP8266 NodeMCU" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 🚀 Overview

The **Smart Plant Intelligence System** is a robust, full-stack application that marries local IoT sensor data collection with real-time cloud-hosted AI algorithms. Beyond a simple dashboard, it actively polls connected ESP8266 microcontrollers streaming continuous telemetry—from temperature, humidity, and soil moisture levels to binary rain state—feeding a trained Random Forest model and a sophisticated heuristics-based disease detection engine. 

Designed for scalability and user interactivity, it operates flawlessly as an educational showpiece for Applied Machine Learning and Embedded Systems integration.

## ✨ Core Features

- **Advanced Machine Learning Pipeline:**
  - **Random Forest Classifier:** Recommends the optimal crop from 22 possible classes using complex environmental factors.
  - **Standardized Features:** Real-Time inference utilizing `scikit-learn`'s `StandardScaler` to mirror training data morphology.
  - **Confidence Metrics:** Returns probabilistic confidence scores and top alternative recommendations.

- **Intelligent Disease Risk Engine (System 2):**
  - Synthesizes live telemetry against 18 deterministic agricultural science triggers to identify pathogenic risk (Viral, Bacterial, Fungal, and Abiotic).
  - Categorizes threats by severity: `CRITICAL` · `HIGH` · `MODERATE` · `WATCH`.
  - Explains symptomatic developments and prescribes precise pesticide treatments and corrective farming techniques.

- **Dynamic Interactive Dashboard:**
  - **Animated Telemetry Tracking:** View automated, real-time sensor updates polling directly via a FastAPI-driven server `/latest` REST endpoint.
  - **Live Visualization:** Dynamic Stepped & Linear Charts rendered gracefully with **Chart.js**, offering historical performance tracking.
  - **Predictive Scenarios:** Execute predefined extreme weather preset modes (e.g., *Monsoon*, *Drought*, *Foggy*) with absolute zero page refresh (Single Page App behavior natively integrated).
  
- **Edge-to-Cloud Integration:**
  - Designed for deployment on **Hugging Face Spaces** utilizing a robust Docker runtime.
  - Configurable ESP8266 C++ firmware allowing rapid toggling between Local API connections, Ngrok tunneling, and Always-On HF Cloud connections.

## 🛠 Tech Stack

*   **Cloud & Backend:** Python, FastAPI, Uvicorn, Docker, Hugging Face Spaces
*   **Machine Learning:** Scikit-Learn 1.4.2, Pandas, Joblib (Random Forest Model)
*   **Frontend UI/UX:** HTML5, CSS3 (Custom Glassmorphic Theme), Vanilla JavaScript ES6
*   **Data Visualization:** Chart.js
*   **Firmware & Hardware:** C++, Arduino IDE, ESP8266 NodeMCU, DHT11 (Temp/Hum), YL-83 (Digital Rain), Soil Moisture Sensor, 16x2 I2C LCD

## 💻 Getting Started

You will need [Python 3.9+](https://python.org/) and an active internet connection.

### Installation (Local Server)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MohammadFayasKhan/smart-crop-intelligene-system.git
   cd smart-crop-intelligene-system
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI backend server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:8000` to interact with the dashboard.

## 🧠 Architectural Highlights

- **Binary-to-Scale Normalization:** Standardizes edge device hardware constraints (digital rain sensors returning binary `1/0`) mapped into continuous representative numerical constants enabling seamless inference on existing complex pre-trained scaler models without data-leakage or architectural rewrite.
- **Asynchronous Telemetry Polling:** Implements dedicated detached asynchronous periodic state loops polling endpoint health and hardware data independently of the central prediction REST cycle, drastically cutting latency.
- **Stateless HTTP/HTTPS Architecture:** Firmware securely engineered extending non-blocking `WiFiClientSecure` implementations handling small 512KB fragmented BearSSL encryption payloads ensuring stability within the constrained ESP8266 heap memory.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/MohammadFayasKhan/smart-crop-intelligene-system/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developed By

<div align="center">
  <h3><strong>Mohammad Fayas Khan</strong></h3>
  <p><em>Computer Science Engineering student focused on AI, ML, and full-stack development. Passionate about building scalable, real-world solutions with strong engineering fundamentals.</em></p>

  <p>
    <a href="https://www.linkedin.com/in/mohammadfayaskhan" target="_blank">
      <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
    </a>&nbsp;
    <a href="https://github.com/MohammadFayasKhan" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
    </a>&nbsp;
    <a href="https://www.instagram.com/fayaskhanx" target="_blank">
      <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" />
    </a>
  </p>
</div>
