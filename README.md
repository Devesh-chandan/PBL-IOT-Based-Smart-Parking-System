# 🅿️ Smart-Park Pro — IoT-Based Smart Parking System

<p align="center">
  <img src="https://img.shields.io/badge/Platform-ESP32--CAM-red?style=for-the-badge&logo=espressif&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/AI-YOLOv8%20%2B%20EasyOCR-FF6F00?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white"/>
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

> A fully automated, end-to-end IoT parking management system built for **S.Y. B.Tech E&TC — Project Based Learning (PBL), 2025–26** at Pune Institute of Computer Technology (PICT), Pune.
>
> The system uses an **ESP32-CAM** to detect vehicles and capture licence plate images, processes them server-side with **YOLOv8** and **EasyOCR**, logs all entry/exit events to **Google Sheets**, controls physical boom barriers via **SG90 servo motors**, and surfaces real-time occupancy data on a **React.js** dashboard — all for under ₹1,230 in hardware.

---

## 📑 Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Repository Structure](#repository-structure)
- [Hardware](#hardware)
  - [Components — Bill of Materials](#components--bill-of-materials)
  - [Pin Wiring](#pin-wiring)
  - [Circuit Notes](#circuit-notes)
- [Software Stack](#software-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1 · Clone the repo](#1--clone-the-repo)
  - [2 · Google Sheets & Service Account](#2--google-sheets--service-account)
  - [3 · Backend (FastAPI)](#3--backend-fastapi)
  - [4 · YOLOv8 Model](#4--yolov8-model)
  - [5 · Frontend (React)](#5--frontend-react)
  - [6 · ESP32-CAM Firmware](#6--esp32-cam-firmware)
- [Configuration Reference](#configuration-reference)
- [API Reference](#api-reference)
- [Model Training (Optional)](#model-training-optional)
- [Testing](#testing)
- [Results](#results)
- [Design Calculations](#design-calculations)
- [Troubleshooting](#troubleshooting)
- [Future Scope](#future-scope)
- [Team](#team)
- [Acknowledgements](#acknowledgements)
- [References](#references)

---

## System Overview

```
Vehicle arrives
      │
      ▼
HC-SR04 detects object within 50 cm
      │
      ▼
ESP32-CAM captures JPEG frame
      │  HTTP POST (raw JPEG bytes)
      ▼
FastAPI server (Python, laptop on same hotspot)
      │
      ├── YOLOv8s  →  detects licence-plate bounding box
      │
      ├── EasyOCR  →  reads alphanumeric plate text
      │
      ├── Google Sheets API
      │     ├── Plate NOT found  →  ENTRY: append row, assign slot
      │     └── Plate found (ENTERED)  →  EXIT: update row, free slot
      │
      └── JSON response  →  ESP32-CAM
                │
                ├── "entry"  →  raise entry servo 90°, hold 5 s, lower
                └── "exit"   →  raise exit  servo 90°, hold 5 s, lower

React dashboard polls /parking-status every 2 s → live slot grid + activity log
```

---

## Architecture

The system is built in three layers:

**Hardware Layer** — ESP32-CAM (AI-Thinker) running Arduino C++ firmware. Reads HC-SR04 every 200 ms, captures a VGA JPEG on trigger, and drives two SG90 servos via PWM (GPIO15 entry, GPIO14 exit).

**Intelligence Layer** — Python FastAPI server. At startup it loads YOLOv8s weights (`model/weights/best.pt`) and the EasyOCR English reader into memory. Each `/upload` request runs YOLO inference → crop → OCR → Google Sheets read → entry/exit logic → sheet write → JSON response. A 10-second read cache prevents hitting Sheets API quota on every dashboard poll.

**Presentation Layer** — React.js SPA with React Router. The `Dashboard` component shows all supported parking locations as cards. `ParkingDetail` is an individual facility view that polls `/parking-status` every 2 seconds to render a live slot grid, scrollable activity log (plate, event type, timestamp, slot), occupancy stats, embedded Google Maps navigation, and rate cards. Supports dark/light theme toggle persisted in `localStorage`.

---

## Features

- **Automated vehicle detection** using HC-SR04 ultrasonic sensor (50 cm threshold, 3-second debounce)
- **Licence plate recognition** via YOLOv8s object detection + EasyOCR, trained on Indian plates
- **Cloud entry/exit logging** to Google Sheets with timestamps and auto-assigned slot numbers
- **Physical gate control** via two independent SG90 servo boom barriers (entry GPIO15, exit GPIO14)
- **Real-time React dashboard** with 2-second polling, slot occupancy grid, activity log, and live/offline connection indicator
- **Multi-parking support** — Dashboard lists six parking locations; each detail page connects to the same shared backend
- **Dark / light mode** with `localStorage` persistence
- **Structured firmware logging** via Serial Monitor (`[BOOT]`, `[SENSOR]`, `[CAMERA]`, `[WiFi]`, `[SERVO]`, …)
- **Persistent backend logging** to `parking_backend.log` via Python's `logging` module
- **Hardware protection circuit** — voltage divider for 5V→3.33V ECHO level-shifting, 1N4007 flyback diodes on servo power pins, stacked decoupling capacitor bank (940 µF + 10 µF + 0.1 µF)
- **Total hardware BOM cost: ₹1,230**

---

## Repository Structure

```
PBL-IOT-Based-Smart-Parking-System/
│
├── hardware/
│   ├── ESP-32_Code.cpp          # Full Arduino C++ firmware for ESP32-CAM
│   ├── hardware_img.jpeg        # Photo of the assembled PCB
│   └── README.md
│
├── backend/
│   ├── main.py                  # FastAPI server — YOLO, OCR, Sheets logic, endpoints
│   ├── test_server.py           # Standalone script to test /upload with local images
│   ├── requirements.txt         # Python dependencies
│   └── parking_backend.log      # Runtime log (auto-generated on first run)
│
├── model/
│   ├── weights/
│   │   └── best.pt              # Trained YOLOv8s licence-plate detector weights
│   ├── train.py                 # Training script (YOLOv8s, 50 epochs, batch 4)
│   ├── evaluate.py              # Validation metrics (mAP@0.5, precision, recall)
│   ├── augment.py               # Albumentations augmentation pipeline
│   ├── prepare_dataset.py       # VOC XML → YOLO TXT converter + 80/10/10 split
│   ├── dataset.yaml             # YOLO dataset config (1 class: license_plate)
│   ├── test_images/             # Sample test images (mycar1–mycar5.jpg)
│   ├── test_detect.py           # Quick single-image inference test
│   ├── yolov8s.pt               # Base YOLOv8s checkpoint (used during training only)
│   └── requirements.txt         # Model-specific Python dependencies
│
├── parking-frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js     # Landing page — parking location cards
│   │   │   └── ParkingDetail.js # Live slot grid + activity log + map + rates
│   │   ├── App.js               # React Router config (/ and /parking/:id)
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json             # React 19, Axios, Lucide, Tailwind, React Router
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
└── README.md
```

> **Note:** `model/weights/best.pt` is included in the repo. `model/raw_dataset/`, `model/data/`, `model/runs/`, `.env`, and the Google Service Account JSON file are excluded by `.gitignore` — see setup steps below.

---

## Hardware

### Components — Bill of Materials

| # | Component | Part / Value | Qty | Purpose | Cost (₹) |
|---|-----------|-------------|-----|---------|----------|
| 1 | ESP32-CAM Module | AI-Thinker OV3660 | 1 | Main controller: WiFi + camera + GPIO | 380 |
| 2 | Ultrasonic Sensor | HC-SR04 | 1 | Vehicle presence detection at gate | 65 |
| 3 | Servo Motor | SG90 5V | 2 | Entry and exit boom barriers | 160 |
| 4 | DC Power Adapter | 5V 3A regulated | 1 | System power supply | 250 |
| 5 | Electrolytic Cap | 470 µF / 16V | 4 | Bulk decoupling (2× main rail + 1× per servo) | 15 |
| 6 | Electrolytic Cap | 10 µF / 16V | 1 | Mid-frequency decoupling on main 5V rail | 7 |
| 7 | Ceramic Cap | 0.1 µF / 16V | 3 | High-frequency decoupling (1× main + 2× servo) | 1.5 |
| 8 | Rectifier Diode | 1N4007 | 2 | Flyback protection on servo power pins | 2 |
| 9 | Resistor | 1 kΩ (R1) | 1 | Lower leg of HC-SR04 ECHO voltage divider | 1 |
| 10 | Resistor | 2 kΩ (R2) | 1 | Upper leg of HC-SR04 ECHO voltage divider | 1 |
| 11 | Resistor | 10 kΩ (R3) | 1 | Pull-down / series damping on TRIG line | 1 |
| 12 | Resistor | 220 Ω (R5) | 1 | Power-indicator LED current limiter | 1 |
| 13 | LED | Red 5 mm | 1 | Power-on indicator (D1) | — |
| 14 | Barrel Jack | 5.5 mm / 2.1 mm PCB mount | 1 | Single 5V power entry point | 10 |
| 15 | Pin Headers | J1–J5 assorted | — | Sensor, servo, UART connectors | 21 |
| 16 | Zero PCB / Perfboard | ~10 × 8 cm | 1 | Mechanical assembly base | 100 |
| 17 | FT232RL USB-TTL | 3.3V logic | 1 | Firmware upload interface (development only) | 200 |
| 18 | Jumper | 2-pin | 1 | GPIO0–GND short for bootloader entry | 1 |
| **Total** | | | | | **₹1,230.5** |

---

### Pin Wiring

#### HC-SR04 Ultrasonic Sensor → ESP32-CAM

| HC-SR04 Pin | ESP32-CAM Connection | Notes |
|-------------|---------------------|-------|
| VCC | +5V rail | — |
| GND | GND | — |
| TRIG | GPIO12 (direct) | 3.3V HIGH is sufficient — HC-SR04 min threshold is 2.4V |
| ECHO | GPIO13 **via voltage divider** | HC-SR04 outputs 5V; GPIO13 max is 3.3V — divider is mandatory |

**Voltage divider for ECHO:**
```
HC-SR04 ECHO  ──  R2 (2kΩ)  ──┬──  GPIO13
                               │
                             R1 (1kΩ)
                               │
                             GND

Vout = 5V × 1k / (1k + 2k) = 3.33V  (270 mV safety margin below 3.6V GPIO max)
```

#### SG90 Servo Motors → ESP32-CAM

| Servo | PWM Signal Pin | VCC | GND |
|-------|---------------|-----|-----|
| Entry barrier | GPIO15 | +5V rail | GND |
| Exit barrier | GPIO14 | +5V rail | GND |

Each servo connector has a dedicated 470 µF electrolytic + 0.1 µF ceramic capacitor across VCC/GND, and a 1N4007 diode (anode → GND, cathode → VCC) for back-EMF clamping.

#### FT232RL USB-TTL → ESP32-CAM (firmware upload only)

| FT232RL Pin | ESP32-CAM Pin |
|-------------|--------------|
| TX | U0R (RX) |
| RX | U0T (TX) |
| GND | GND |
| VCC | **Unconnected** (ESP32-CAM is powered by the 5V adapter) |

> ⚠️ **Set the FT232RL voltage select jumper to 3.3V before connecting.** Using 5V logic will permanently damage the ESP32-CAM UART pins.

---

### Circuit Notes

- All components share a common **+5V** / **GND** bus fed through the barrel jack from the regulated 5V/3A adapter.
- The **AMS1117-3.3** LDO on the ESP32-CAM board internally generates the 3.3V required by the ESP32 SoC — no external regulator is needed.
- The **PCB antenna** of the ESP32-CAM is at the edge opposite the camera connector. Keep all wiring ≥ 1–2 cm away from this edge to avoid degrading WiFi signal.
- Typical system current draw: **~709 mA**. Peak (both servos stalled simultaneously): **~1.73 A**. The 5V/3A adapter provides **1.73× headroom over worst-case peak load**.

---

## Software Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Firmware | Arduino C++ (ESP-IDF) | ESP32 board pkg | Sensor polling, image capture, servo PWM, HTTP POST |
| Object Detection | YOLOv8s (Ultralytics) | 8.4.21 | Licence plate bounding-box detection |
| OCR | EasyOCR | 1.7.1 | Alphanumeric text extraction from cropped plate image |
| Backend | FastAPI + Uvicorn | 0.104.1 / 0.24.0 | REST API server, model serving, Sheets integration |
| Sheets Client | gspread + google-auth | — | Read/write Google Sheets as cloud database |
| Image Processing | OpenCV | 4.8.1.78 | Image decode, colour conversion, crop |
| ML Runtime | PyTorch + torchvision | 2.1.0 / 0.16.0 | YOLO and EasyOCR model runtime |
| Augmentation | Albumentations | 1.3.1 | Training data augmentation pipeline |
| Frontend | React.js | 19.x | UI framework |
| Routing | React Router DOM | 7.x | `/` Dashboard, `/parking/:id` Detail page |
| HTTP Client | Axios | 1.x | Frontend → Backend API polling |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS framework |
| Icons | Lucide React | 1.7 | SVG icon set |

---

## Prerequisites

### Software
- **Python 3.10** or 3.11
- **Node.js 18+** and npm
- **Arduino IDE 2.x** with the ESP32 board package installed:
  - Go to *File → Preferences → Additional Board Manager URLs* and add:
    `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
  - Then *Tools → Board → Board Manager*, search **ESP32**, install **esp32 by Espressif Systems**
- **ESP32Servo library** — install via *Tools → Library Manager → search "ESP32Servo" → install "ESP32Servo by Kevin Harrington"*
- A **Google account** with Google Sheets API and Google Drive API enabled (for the service account)

### Network
- A mobile hotspot or local WiFi network that both the laptop (server) and the ESP32-CAM can connect to simultaneously.

### Hardware (for physical deployment)
- All components in the BOM above
- FT232RL USB-TTL converter for the one-time firmware upload
- Soldering iron, solder, and perfboard

---

## Installation & Setup

### 1 · Clone the repo

```bash
git clone https://github.com/Devesh-chandan/PBL-IOT-Based-Smart-Parking-System.git
cd PBL-IOT-Based-Smart-Parking-System
```

---

### 2 · Google Sheets & Service Account

The backend uses a Google Service Account to authenticate with the Sheets API. The sheet acts as the vehicle database.

**Create the Google Sheet**

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com).
2. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
3. Add this header row in **Sheet1** (row 1, columns A–E):

```
Plate Number    Slot    Status    Entry Time    Exit Time
```

**Create a Service Account**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. Enable the **Google Sheets API** and **Google Drive API** for the project.
3. Go to *IAM & Admin → Service Accounts → Create Service Account*.
4. After creating it, go to *Keys → Add Key → Create new key → JSON*. Download the JSON key file.
5. Rename the file (e.g., `service_account.json`) and place it in the `backend/` directory.
6. **Share your Google Sheet** with the service account's email address (found inside the JSON) with **Editor** permission.

**Configure `backend/main.py`**

```python
SHEET_ID      = "your_google_sheet_id_here"
SHEET_NAME    = "Sheet1"
TOTAL_SLOTS   = 20                           # set to your parking capacity
JSON_KEY_PATH = r"service_account.json"      # filename of your key file in backend/
WEIGHTS_PATH  = r"..\model\weights\best.pt"  # Windows — adjust for Linux/macOS
```

> On Linux/macOS, change `WEIGHTS_PATH` to `"../model/weights/best.pt"`.

---

### 3 · Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

> **PyTorch note:** `requirements.txt` pins CPU-only torch. For GPU inference, install the CUDA-enabled wheels from [pytorch.org](https://pytorch.org/get-started/locally/) instead — the rest of the requirements remain the same.

Start the server (always run from inside the `backend/` directory so relative paths resolve):

```bash
cd backend
python main.py
```

Expected startup output:
```
2026-04-19 11:27:45  [INFO]  Loading YOLO model...
2026-04-19 11:27:45  [INFO]  Loading EasyOCR...
2026-04-19 11:27:45  [WARNING]  Using CPU. Note: This module is much faster with a GPU.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

The `Using CPU` warning from EasyOCR is expected on machines without a CUDA GPU and does not affect functionality.

**Find your laptop's IP on the hotspot** (needed for the firmware):
```bash
# Windows
ipconfig
# Look for: WiFi adapter → IPv4 Address → typically 192.168.43.x

# Linux / macOS
ip addr   # or: ifconfig
```

---

### 4 · YOLOv8 Model

The repository already includes `model/weights/best.pt` — a YOLOv8s model trained on Indian licence plate images. No extra steps are needed for the default setup.

If you want to retrain on your own dataset, see [Model Training (Optional)](#model-training-optional).

---

### 5 · Frontend (React)

```bash
cd parking-frontend
npm install
npm start
```

Opens at `http://localhost:3000`. The landing page (`Dashboard`) shows all supported parking locations as interactive cards. Clicking any card routes to `/parking/:id` (`ParkingDetail`), which polls the live backend.

**If your backend runs on a different host or port**, update `API_BASE` in `parking-frontend/src/components/ParkingDetail.js`:

```js
const API_BASE = "http://localhost:8000";   // ← change to your backend URL
```

**Supported parking locations** (pre-configured in `Dashboard.js` and `ParkingDetail.js`):

| URL Route | Parking Name | Capacity |
|-----------|-------------|---------|
| `/parking/phoenix` | Phoenix Market City Parking | 20 slots |
| `/parking/inorbit` | Inorbit Mall Parking 1 | 50 slots |
| `/parking/seasons` | Seasons Mall Basement | 30 slots |
| `/parking/amanora` | Amanora Mall Main | 40 slots |
| `/parking/pavillion` | The Pavillion Parking | 25 slots |
| `/parking/westend` | Westend Mall Parking 1 | 45 slots |

All detail pages connect to the **same** FastAPI backend and Google Sheet.

---

### 6 · ESP32-CAM Firmware

#### Arduino IDE board settings

Go to **Tools** and set **exactly**:

| Setting | Value |
|---------|-------|
| Board | AI Thinker ESP32-CAM |
| Upload Speed | 115200 |
| CPU Frequency | 240 MHz |
| Flash Frequency | 80 MHz |
| Flash Mode | QIO |
| Flash Size | 4MB (32Mb) |
| Partition Scheme | **Huge APP (3MB No OTA)** |
| Core Debug Level | None |
| Port | COMx (check Device Manager on Windows) |

> The **Huge APP** partition scheme is required because the firmware with YOLO + camera libraries exceeds the default partition size.

#### Configure WiFi and server URL

Open `hardware/ESP-32_Code.cpp` and fill in the three empty strings:

```cpp
const char* WIFI_SSID     = "your_hotspot_name";
const char* WIFI_PASSWORD = "your_hotspot_password";
const char* SERVER_URL    = "http://192.168.43.xxx:8000/upload";
//                                       ^^^ your laptop's IP on the hotspot
```

#### Upload procedure

```
Step 1  Connect FT232RL: TX→U0R, RX→U0T, GND→GND  (leave VCC unconnected)
Step 2  INSERT the GPIO0–GND jumper on the PCB
Step 3  Plug in the 5V barrel jack adapter
         ESP32-CAM boots into bootloader mode (GPIO0 = LOW)
Step 4  Select the correct COM port in Arduino IDE
Step 5  Click Upload — wait for "Done uploading."
Step 6  REMOVE the GPIO0–GND jumper
Step 7  Unplug and replug the 5V adapter (power cycle)
         ESP32-CAM now boots normally and runs your firmware
```

> ⚠️ **If you leave the GPIO0 jumper inserted, the ESP32-CAM will always boot into flash mode and your code will never run.**

#### Verify with Serial Monitor

Open Arduino IDE Serial Monitor at **115200 baud**. You should see:

```
[BOOT] Smart Parking System Starting...
[SERVO] Barriers initialized to lowered position
[CAMERA] Initialized successfully
[WiFi] Connecting to your_ssid....
[WiFi] Connected!
[WiFi] ESP32-CAM IP Address: 192.168.43.yyy
[BOOT] System ready. Monitoring for vehicles...
[SENSOR] Distance: 312.45 cm
[SENSOR] Distance: 310.20 cm
...
[TRIGGER] Vehicle detected! Capturing image...
[CAMERA] Captured image, size: 38420 bytes
[SERVER] Response: {"status":"entry","plate":"MH12AB1234","slot":1}
[PARKING] New vehicle — raising ENTRY barrier
[SERVO] Entry barrier RAISED
[SERVO] Entry barrier LOWERED
```

#### Tunable firmware constants

```cpp
#define DETECTION_DISTANCE_CM   50     // HC-SR04 trigger threshold in cm
#define BARRIER_RAISE_DELAY_MS  5000   // How long the barrier stays up (ms)
#define SERVO_RAISED_ANGLE      90     // Servo angle for open gate (degrees)
#define SERVO_LOWERED_ANGLE     0      // Servo angle for closed gate (degrees)
#define DEBOUNCE_DELAY_MS       3000   // Min ms between successive triggers
```

---

## Configuration Reference

| File | Variable | Default | Description |
|------|---------|---------|-------------|
| `backend/main.py` | `SHEET_ID` | — | Google Sheets document ID |
| `backend/main.py` | `SHEET_NAME` | `"Sheet1"` | Worksheet tab name |
| `backend/main.py` | `TOTAL_SLOTS` | `20` | Total parking capacity |
| `backend/main.py` | `JSON_KEY_PATH` | — | Service account JSON filename in `backend/` |
| `backend/main.py` | `WEIGHTS_PATH` | `../model/weights/best.pt` | Path to YOLOv8 weights |
| `backend/main.py` | `CACHE_DURATION` | `10` s | Google Sheets read cache TTL |
| `hardware/ESP-32_Code.cpp` | `WIFI_SSID` | `""` | Hotspot SSID |
| `hardware/ESP-32_Code.cpp` | `WIFI_PASSWORD` | `""` | Hotspot password |
| `hardware/ESP-32_Code.cpp` | `SERVER_URL` | `""` | `http://<laptop-ip>:8000/upload` |
| `hardware/ESP-32_Code.cpp` | `DETECTION_DISTANCE_CM` | `50` | Trigger distance in cm |
| `hardware/ESP-32_Code.cpp` | `DEBOUNCE_DELAY_MS` | `3000` | Minimum ms between captures |
| `hardware/ESP-32_Code.cpp` | `BARRIER_RAISE_DELAY_MS` | `5000` | Gate open duration in ms |
| `hardware/ESP-32_Code.cpp` | `SERVO_RAISED_ANGLE` | `90` | Servo angle for open |
| `hardware/ESP-32_Code.cpp` | `SERVO_LOWERED_ANGLE` | `0` | Servo angle for closed |
| `parking-frontend/src/components/ParkingDetail.js` | `API_BASE` | `http://localhost:8000` | Backend URL for frontend |

---

## API Reference

All endpoints are served by the FastAPI server at `http://<host>:8000`. Auto-generated interactive docs are available at `http://localhost:8000/docs`.

---

### `POST /upload`

Receives a raw JPEG image from the ESP32-CAM and runs the complete pipeline: YOLO plate detection → EasyOCR → Google Sheets entry/exit logic → servo command response.

**Request**
```
Content-Type: image/jpeg
Body: <raw JPEG bytes>
Timeout: 10 seconds (model inference on CPU takes 2–5 s)
```

**Response — success scenarios**

```jsonc
// Vehicle entering for the first time
{ "status": "entry", "plate": "MH12AB1234", "slot": 7 }

// Vehicle exiting (plate already in sheet as ENTERED)
{ "status": "exit", "plate": "MH12AB1234" }
```

**Response — error scenarios**

```jsonc
{ "status": "error", "message": "Image too small" }      // < 1000 bytes
{ "status": "error", "message": "Failed to decode" }     // corrupt JPEG
{ "status": "error", "message": "No plate detected" }    // YOLO conf < 0.5
{ "status": "error", "message": "OCR could not read text" }
{ "status": "error", "message": "Parking Full" }         // all TOTAL_SLOTS occupied
```

**ESP32 firmware action on response:**
```
"entry"  →  raiseBarrier(isEntry=true)  →  5 s delay  →  lowerBarrier(isEntry=true)
"exit"   →  raiseBarrier(isEntry=false) →  5 s delay  →  lowerBarrier(isEntry=false)
anything else  →  log [WARNING], no servo action
```

---

### `GET /parking-status`

Returns all rows from the Google Sheet as a JSON array. Polled by the React frontend every 2 seconds. A 10-second server-side cache prevents excessive Sheets API calls.

**Response**
```json
[
  {
    "Plate Number": "MH12AB1234",
    "Slot": 1,
    "Status": "ENTERED",
    "Entry Time": "2026-04-14 09:15:22",
    "Exit Time": "-"
  },
  {
    "Plate Number": "MH14CD5678",
    "Slot": 2,
    "Status": "EXITED",
    "Entry Time": "2026-04-14 09:20:00",
    "Exit Time": "2026-04-14 11:45:00"
  }
]
```

The frontend derives occupancy from this: rows where `Status == "ENTERED"` count as occupied slots.

---

### `GET /health`

Health check confirming both ML models were loaded successfully at server startup.

**Response**
```json
{ "status": "ok", "yolo": true, "ocr": true }
```

Use this endpoint before running tests or checking backend availability:
```bash
curl http://localhost:8000/health
```

---

## Model Training (Optional)

`model/weights/best.pt` is included and works out of the box. Follow these steps only if you want to train on your own dataset.

### Step 1 — Prepare your dataset

Your raw dataset should contain image files (`.jpg`/`.png`) paired with Pascal VOC `.xml` annotation files in the same folder.

```bash
cd model
# Edit RAW_FOLDER in prepare_dataset.py to point to your images + XMLs
python prepare_dataset.py
```

This creates a `model/data/` folder with:
- 80% train / 10% val / 10% test split
- YOLO-format `.txt` label files (converted from VOC XML)

Then update `dataset.yaml` with the absolute path to your data folder:

```yaml
path: /absolute/path/to/model/data
train: images/train
val:   images/val
test:  images/test
nc: 1
names:
  - license_plate
```

### Step 2 — (Optional) Augment the training set

```bash
python augment.py
```

Applies motion blur, brightness/contrast jitter, RGB shift, horizontal flip, and Gaussian noise. Generates **2 augmented copies** per original training image in-place.

### Step 3 — Install model dependencies

```bash
pip install -r model/requirements.txt
```

### Step 4 — Train

```bash
python train.py
```

Runs YOLOv8s for 50 epochs at 640×640, batch size 4, patience 10 (early stopping). Best weights are saved to `model/runs/detect/plate_detector/weights/best.pt`.

```bash
# Copy the trained weights to the location expected by the backend
cp model/runs/detect/plate_detector/weights/best.pt model/weights/best.pt
```

### Step 5 — Evaluate

```bash
python evaluate.py
```

Prints mAP@0.5, mAP@0.5:0.95, precision, and recall on the validation set.

---

## Testing

The project was validated using a **phased bottom-up** approach — each subsystem verified in isolation before integration.

| Phase | Subsystem | Method |
|-------|----------|--------|
| 1 | Power supply | Multimeter — 5V at barrel jack, capacitor bank, servo connectors |
| 2 | Firmware upload + boot | FT232RL + Serial Monitor @ 115200 baud — observe `[BOOT]` messages |
| 3 | HC-SR04 sensor | Multimeter on ECHO divider output (~2.5V); Serial Monitor distance readings |
| 4 | Servo motors | Arduino servo sweep sketch — both GPIO14 and GPIO15 verified |
| 5 | Backend pipeline | `test_server.py` — sends local test images to `/upload`, checks Sheets updates |
| 6 | React frontend | Browser — slot grid and activity log verified against Sheets changes from Phase 5 |
| 7 | Full integration | Physical object placed within 50 cm → end-to-end: sensor → image → POST → YOLO → OCR → Sheets → servo → dashboard |

### Serial Monitor debug tags (firmware)

```
[BOOT]    Startup and initialisation messages
[SENSOR]  Distance reading every 200 ms
[TRIGGER] Vehicle detected, image capture starting
[CAMERA]  Capture size in bytes, success / failure
[WiFi]    Connection status and reconnection attempts
[HTTP]    HTTP response code from FastAPI
[SERVER]  Raw JSON response string from FastAPI
[PARKING] Entry or exit action taken
[SERVO]   Barrier raised / lowered
[WARNING] Unknown / error server response
[ERROR]   Camera init failure, HTTP error code
```

---

## Results

All subsystems passed testing in both isolation and full integration.

| Test Parameter | Observed Result | Status |
|---------------|----------------|--------|
| Vehicle detection range | Consistent triggering at 50 cm threshold | ✅ Pass |
| Image capture + WiFi POST | JPEG (30–50 KB) delivered to FastAPI server | ✅ Pass |
| YOLOv8 plate detection | Bounding box correctly located and cropped | ✅ Pass |
| EasyOCR text extraction | Alphanumerics correctly read for standard Indian plate formats | ✅ Pass |
| Entry logic + Google Sheets write | Plate, slot, timestamp written on first detection | ✅ Pass |
| Exit logic + Google Sheets update | Status updated to EXITED, slot freed on second detection | ✅ Pass |
| Entry servo actuation (GPIO15) | Raised to 90°, held 3 s, lowered to 0° | ✅ Pass |
| Exit servo actuation (GPIO14) | Raised to 90°, held 3 s, lowered to 0° | ✅ Pass |
| React dashboard real-time update | Slot grid and activity log refreshed within 2 s | ✅ Pass |
| 5V rail voltage stability | Rail remained above 4.7V brownout threshold during all WiFi TX + servo events | ✅ Pass |

**Comparison with related work:**

| Feature | This System | Muthukumar & Abhinaya | Gupta et al. |
|---------|------------|----------------------|-------------|
| Licence Plate Recognition | ✅ YOLOv8 + EasyOCR | ❌ | ❌ |
| Automated Boom Gate | ✅ SG90 servo | ⚠️ Partial | ❌ |
| Real-time Web Dashboard | ✅ React.js | ⚠️ Basic UI | Mobile App |
| Cloud Database | ✅ Google Sheets API | ❌ Local DB only | ⚠️ Limited cloud |
| Single-board cost | ₹380 (ESP32-CAM) | Higher (MCU + WiFi) | Higher (Raspberry Pi) |

---

## Design Calculations

### Voltage divider — HC-SR04 ECHO (5V → 3.33V)

```
R1 = 1 kΩ (to GND),  R2 = 2 kΩ (in series with ECHO signal path)

Vout = 5V × 1k / (1k + 2k)  =  3.33V   ← 270 mV below 3.6V GPIO absolute maximum
Idiv = 5V / 3kΩ              =  1.67 mA  ← negligible power draw
```

### Decoupling capacitor voltage sag — ΔV = I × Δt / C

| Scenario | C | I (peak) | Δt (realistic) | ΔV | Status |
|----------|---|----------|---------------|----|--------|
| ESP32-CAM WiFi burst | 950 µF | 500 mA | 100 µs | 52 mV | ✅ SAFE |
| Servo switching | 470 µF | 250 mA | 100 µs | 53 mV | ✅ SAFE |
| Brownout threshold | — | — | — | 300 mV budget | — |

### System power budget

| Component | Typical Current | Peak Current |
|-----------|---------------|-------------|
| ESP32-CAM (WiFi TX + camera) | 180 mA | 500 mA |
| SG90 Servo × 2 | 500 mA | 1,200 mA (stall) |
| HC-SR04 | 15 mA | 15 mA |
| Power LED + R5 | 14 mA | 14 mA |
| **System Total** | **709 mA** | **1,729 mA** |
| 5V / 3A adapter | 3,000 mA | 3,000 mA |
| **Headroom** | **4.23×** | **1.73×** |

### HC-SR04 distance formula

```
Distance (cm) = Echo pulse duration (µs) × 0.034 / 2

Detection at 50 cm:  echo pulse = 50 / 0.01715 = 2,915 µs
Polling interval: 200 ms (firmware)  vs  60 ms (HC-SR04 minimum) → no false echoes
```

### SG90 servo PWM

```
PWM period: 20 ms (50 Hz)
~1.0 ms pulse → 0°  (barrier down)
~1.5 ms pulse → 90° (barrier up)
The ESP32Servo library handles pulse width automatically — use servo.write(angle)
```

---

## Troubleshooting

**`[WiFi] Connection failed! Restarting...`**  
Ensure the hotspot is active *before* powering the circuit. Verify `WIFI_SSID` and `WIFI_PASSWORD` are correct. The firmware will restart and retry automatically.

**`[CAMERA] Init error: 0x...`**  
Check the camera ribbon cable seating. Also occurs with an under-rated power supply — verify the adapter is a **regulated** 5V/3A model. Ensure `WEIGHTS_PATH` in `main.py` is correct for your OS.

**`[HTTP] Error code: -1` or connection refused**  
The ESP32-CAM cannot reach the FastAPI server. Confirm both devices are on the same hotspot network. Run `ipconfig` (Windows) or `ip addr` (Linux) on the laptop and verify the IP matches `SERVER_URL` in the firmware. Confirm `python main.py` is running.

**FastAPI server running but `/upload` always returns `"No plate detected"`**  
The YOLO model cannot find a plate. Check: image is not too blurry (lower `jpeg_quality` number in firmware → better quality), plate is within camera frame at trigger distance, and YOLO confidence threshold (0.5 in `detect_plate()`) is appropriate. Review backend logs for bounding-box confidence values.

**OCR reads garbage or partial text**  
Improve image resolution by changing `FRAMESIZE_VGA` to `FRAMESIZE_SVGA` in firmware. Ensure adequate lighting (the OV3660 auto-exposure helps, but very dark environments still fail). Check that the YOLO crop is centred on the plate (review bounding box coordinates logged by the backend).

**Google Sheets `APIError: RESOURCE_EXHAUSTED` (quota exceeded)**  
The 10-second read cache in the backend (`CACHE_DURATION = 10`) should prevent this. If still occurring, increase `CACHE_DURATION` or check that you are not running multiple backend instances simultaneously.

**ESP32 resets during WiFi transmission (brownout)**  
Verify all 470 µF electrolytic capacitors are correctly polarised (positive lead to +5V) and physically close to the ESP32-CAM power pins. Confirm the adapter is regulated and rated at least 2A. Check that 1N4007 diodes are oriented correctly (cathode stripe toward +5V).

**Servo jitters on first boot after upload**  
Remove the GPIO0–GND jumper and power-cycle. The PWM signal is undefined during bootloader mode and causes the servo to twitch. Normal behaviour disappears once the firmware runs.

**React dashboard shows "Offline"**  
FastAPI server is not reachable from the browser. Ensure the backend is running (`python main.py`), and that `API_BASE` in `ParkingDetail.js` matches the actual host/port. Also check browser console for CORS errors — the backend allows all origins by default.

---

## Future Scope

- **Mobile application** — Android/iOS app for real-time availability, push notifications on entry/exit, and in-app UPI / Razorpay payment (the `qrcode` Python library is already in the stack).
- **Slot reservation** — Pre-booking via web or mobile with time-based slot locking.
- **Automated fee calculation** — Entry/exit timestamps already stored; integrating a payment gateway closes the billing loop.
- **Improved OCR** — Fine-tune EasyOCR or train a custom model on Indian plate fonts for better accuracy under rain, low light, and partial occlusion.
- **Dedicated per-gate hardware** — Deploy separate ESP32-CAM units at entry and exit gates to support simultaneous events.
- **Per-bay occupancy sensors** — IR or ultrasonic sensors at individual bays for slot-level detection independent of the gate camera.
- **Cloud-hosted backend** — Deploy FastAPI to AWS / GCP / Azure so the dashboard is accessible from anywhere without a laptop acting as the local server.
- **EV bay tagging** — Surface EV-charger availability per slot so EV owners can filter and reserve charging-enabled spaces through the dashboard or mobile app.

---

## Team

**S.Y. B.Tech E&TC — 2025–26, Pune Institute of Computer Technology (PICT)**

| Name | Roll No. |
|------|---------|
| Shriyansh Bhardwaj | S240502028 |
| Prachi Biradar | S240502031 |
| Tisha Bora | S240502036 |
| Devesh Chandan | S240502042 |
| Aditya Deshpande | S240502071 |

**Project Guide:** Prof. A. A. Bidkar, Dept. of Electronics & Telecommunication Engineering  
**Head of Department:** Dr. G. S. Mundada, Dept. of E&TC  
**Institute:** Pune Institute of Computer Technology (PICT), Pune – 43  
*(Autonomous Institute affiliated to Savitribai Phule Pune University)*

---

## Acknowledgements

We express our sincere gratitude to **Prof. A. A. Bidkar** for his invaluable guidance and continuous support, to **Dr. G. S. Mundada** for providing institutional resources and encouragement, and to **Laxman Pawal** (Lab Assistant) for his technical assistance during hardware assembly and testing. We also thank all faculty members of the E&TC Department at PICT, our classmates, and our families for their support throughout this project.

---

## References

1. Gupta, A., Kulkarni, S., Jathar, V., Sharma, V., & Jain, N. (2017). Smart car parking management system using IoT. *Am. J. Sci. Eng. Technol*, 2(4), 112–119.
2. De, V. P., & Ragavesh, D. (2016). Automated parking management system using image processing techniques. *International Journal of Applied Information Systems*, 11(3), 6–10.
3. Sharma, P., Gupta, S., Singh, P., Shejul, K., & Reddy, D. (2022). Automatic number plate recognition and parking management. In *2022 ACCAI* (pp. 1–8). IEEE.
4. Jabbar, W. A., Wei, C. W., Azmi, N. A. A. M., & Haironnazli, N. A. (2021). An IoT Raspberry Pi-based parking management system for smart campus. *Internet of Things*, 14, 100387.
5. Ala'anzy, M. A., Abilakim, A., Zhanuzak, R., & Li, L. (2025). Real time smart parking system based on IoT and fog computing evaluated through a practical case study. *Scientific Reports*, 15(1), 33483.

---

<p align="center">Made with ❤️ at PICT Pune &nbsp;·&nbsp; Academic Year 2025–26</p>
