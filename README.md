# Smart-Park Pro: IoT-Based Smart Parking System

An automated, end-to-end parking management solution that leverages **YOLOv8** for license plate detection, **EasyOCR** for character recognition, and **Google Sheets** for real-time cloud logging. The system features a responsive **React** dashboard and is designed to interface with **ESP32-CAM** hardware.

---

## 🚀 System Overview

1.  **Detection**: A vehicle arrives and triggers an IR/Ultrasonic sensor connected to an ESP32.
2.  **Capture**: The ESP32-CAM captures an image and sends it via HTTP POST to the Python FastAPI server.
3.  **Processing**:
    * **YOLOv8s** detects the bounding box of the license plate.
    * **EasyOCR** extracts the alphanumeric text from the cropped plate image.
4.  **Logging**: The server checks the plate against a **Google Sheets** database to determine if the vehicle is entering or exiting.
5.  **Control**: The server sends a command back to the ESP32 to operate the gate (e.g., `OPEN_GATE`), and the live dashboard updates via WebSockets/Polling.

---

## 🛠️ Tech Stack

* **Model**: YOLOv8s (Detection), EasyOCR (Recognition)
* **Backend**: FastAPI (Python), GSpread (Google Sheets API)
* **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), Axios
* **Hardware**: ESP32-CAM, HC-SR04 Ultrasonic Sensor, SG90 Servo Motor

---

## 📂 Project Structure

```text
parking_system/
├── model/                # YOLOv8 training & inference logic
│   ├── weights/          # Trained model weights (best.pt)
│   ├── train.py          # Script for model training
│   └── dataset.yaml      # YOLO dataset configuration
├── backend/              # FastAPI Server
│   ├── main.py           # Core API & Google Sheets integration
│   └── requirements.txt  # Python dependencies
├── parking-frontend/     # React Dashboard
│   ├── src/App.js        # Main UI component
│   └── package.json      # Node dependencies
└── README.md             # Project documentation
