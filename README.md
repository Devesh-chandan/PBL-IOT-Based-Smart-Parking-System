# TPBL Parking System

An automated parking management system using YOLOv8 license plate detection, OCR, and real-time Excel logging.

## System Overview

Car arrives
  → IR/Ultrasonic sensor triggers ESP32
  → ESP32-CAM captures image
  → HTTP POST to Python server
  → YOLOv8 detects plate region
  → EasyOCR reads plate text
  → Entry logged to parking_log.xlsx
  → OPEN_GATE sent to ESP32
  → Barrier raises

Car exits
  → Same detection flow
  → Exit time logged to same row
  → Status updated to EXITED

## Project Structure

parking_system/
├── model/                        # YOLOv8 training (Parth)
│   ├── weights/                  # best.pt (see Google Drive link below)
│   ├── detect.py                 # main interface — import this
│   ├── train.py                  # training script
│   ├── evaluate.py               # evaluation script
│   ├── augment.py                # data augmentation
│   ├── prepare_dataset.py        # dataset conversion
│   └── requirements.txt
│
├── backend/                      # FastAPI server
│   ├── main.py                   # server + API endpoints
│   ├── test_server.py            # testing script
│   └── requirements.txt
│
├── frontend/                     # React dashboard
│   └── README.md
│
├── hardware/                     # ESP32 code
│   └── README.md
│
└── README.md

## Model Performance

| Metric       | Score  |
|--------------|--------|
| mAP@0.5      | 0.948  |
| mAP@0.5:0.95 | 0.681  |
| Precision    | 0.988  |
| Recall       | 0.864  |

Architecture: YOLOv8s
Dataset: 540 training images (augmented), 22 val, 23 test

## Model Weights

Download best.pt from Google Drive and place at model/weights/best.pt

Google Drive Link: YOUR_LINK_HERE

## Setup

### Model

cd model
pip install -r requirements.txt

### Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

## API Endpoints

### POST /upload

Receives image from ESP32, detects plate, logs to Excel.

POST http://YOUR_PC_IP:8000/upload?lane=entry
POST http://YOUR_PC_IP:8000/upload?lane=exit

Body: multipart/form-data
  image: <jpeg file>

Response:
  { "status": "OPEN_GATE", "plate": "MH12AB1234", "time": "2026-03-17 10:30:00" }
  { "status": "NO_PLATE" }
  { "status": "NOT_FOUND" }

### GET /records

Returns all parking records for the React dashboard.

GET http://YOUR_PC_IP:8000/records

Response:
{
  "records": [
    {
      "id": 1,
      "plate": "MH12AB1234",
      "entry_time": "2026-03-17 10:30:00",
      "exit_time": "2026-03-17 11:15:00",
      "status": "EXITED"
    }
  ]
}

## Team

| Member | Responsibility                  |
|--------|---------------------------------|
| Parth  | Model training + backend server |
| TBD    | React frontend                  |
| TBD    | ESP32 hardware                  |

## Tech Stack

- YOLOv8s — license plate detection
- EasyOCR — plate text recognition
- FastAPI — backend server
- openpyxl — Excel logging
- React — frontend dashboard
- ESP32-CAM — image capture
- HC-SR04 — vehicle detection