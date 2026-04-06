# ============================================================
# main.py — FastAPI Backend
# Smart Parking System
#
# Endpoints:
#   POST /upload?lane=entry   ← called by ESP32-CAM
#   POST /upload?lane=exit    ← called by ESP32-CAM
#   GET  /parking-status      ← called by React frontend
#   GET  /health              ← for testing
#
# Pipeline for /upload:
#   1. Receive JPEG from ESP32-CAM
#   2. YOLO detects number plate bounding box
#   3. Crop plate region from image
#   4. EasyOCR reads plate text from cropped region
#   5. Write entry/exit record to Google Sheets
#   6. Return JSON status to ESP32-CAM
# ============================================================

import os
import re
import cv2
import numpy as np
import easyocr
import requests
import logging
from datetime import datetime
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()  # Load .env file for API keys

# ============================================================
# Logging
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("parking_backend.log")
    ]
)
log = logging.getLogger(__name__)

# ============================================================
# Configuration — store secrets in .env file
# ============================================================
API_KEY     = os.getenv("GOOGLE_API_KEY", "AIzaSyDB-bZ4E1EK4tjn5-mTGldgdIk8ASN6JFI")
SHEET_ID    = os.getenv("SHEET_ID", "12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk")
SHEET_NAME  = "Sheet1"
TOTAL_SLOTS = 20

# Path to your YOLO weights file
WEIGHTS_PATH = "D:\SY_PBL\PBL-IOT-Based-Smart-Parking-System\model\weights\best.pt"

# Confidence threshold for YOLO plate detection
YOLO_CONF = 0.5

# ============================================================
# Load YOLO model and EasyOCR once at startup
# Loading these inside the endpoint would be very slow
# ============================================================
log.info("Loading YOLO model...")
yolo_model = YOLO(WEIGHTS_PATH)
log.info("YOLO model loaded successfully")

log.info("Loading EasyOCR reader...")
# gpu=True if you have CUDA GPU, False for CPU
ocr_reader = easyocr.Reader(['en'], gpu=False)
log.info("EasyOCR loaded successfully")

# ============================================================
# FastAPI app
# ============================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Google Sheets helpers
# ============================================================

def sheets_read():
    """Read all rows from Google Sheet. Returns list of dicts."""
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/"
        f"{SHEET_ID}/values/{SHEET_NAME}?key={API_KEY}"
    )
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        if "error" in data:
            log.error(f"Sheets read error: {data['error']['message']}")
            return []
        values = data.get("values", [])
        if len(values) < 1:
            return []
        headers = values[0]
        rows    = values[1:]
        result  = []
        for row in rows:
            entry = {}
            for i, h in enumerate(headers):
                entry[h] = row[i] if i < len(row) else "-"
            result.append(entry)
        return result
    except Exception as e:
        log.error(f"Sheets read exception: {e}")
        return []


def sheets_append_row(values_list):
    """Append a new row to Google Sheet."""
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/"
        f"{SHEET_ID}/values/{SHEET_NAME}:append"
        f"?valueInputOption=USER_ENTERED&key={API_KEY}"
    )
    body = {"values": [values_list]}
    try:
        res = requests.post(url, json=body, timeout=10)
        if res.status_code != 200:
            log.error(f"Sheets append error: {res.text}")
            return False
        return True
    except Exception as e:
        log.error(f"Sheets append exception: {e}")
        return False


def sheets_update_cell(row_number, col_letter, value):
    """
    Update a specific cell in Google Sheet.
    row_number is 1-based (row 1 = header).
    Data rows start at row 2.
    """
    range_  = f"{SHEET_NAME}!{col_letter}{row_number}"
    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/"
        f"{SHEET_ID}/values/{range_}"
        f"?valueInputOption=USER_ENTERED&key={API_KEY}"
    )
    body = {"values": [[value]]}
    try:
        res = requests.put(url, json=body, timeout=10)
        if res.status_code != 200:
            log.error(f"Sheets update error: {res.text}")
            return False
        return True
    except Exception as e:
        log.error(f"Sheets update exception: {e}")
        return False


def assign_slot(records):
    """
    Find the next available parking slot (1 to TOTAL_SLOTS).
    Looks at currently ENTERED cars and finds first free slot.
    """
    occupied = set()
    for r in records:
        if r.get("Status") == "ENTERED":
            try:
                occupied.add(int(r.get("Slot", 0)))
            except ValueError:
                pass
    for slot in range(1, TOTAL_SLOTS + 1):
        if slot not in occupied:
            return slot
    return None  # Parking full


# ============================================================
# Image processing helpers
# ============================================================

def decode_image(image_bytes):
    """Convert raw bytes from ESP32-CAM to OpenCV image array."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img


def detect_plate(img):
    """
    Run YOLO on image to detect number plate bounding box.
    Returns cropped plate image, or None if not detected.
    """
    results = yolo_model(img, conf=YOLO_CONF)
    for r in results:
        if len(r.boxes) == 0:
            log.warning("YOLO: No plate detected in image")
            return None

        # Take the highest confidence detection
        best_idx  = int(r.boxes.conf.argmax())
        bbox      = r.boxes.xyxy[best_idx].tolist()
        x1, y1, x2, y2 = [int(v) for v in bbox]
        confidence = float(r.boxes.conf[best_idx])
        log.info(f"YOLO: Plate detected  conf={confidence:.2f}  bbox={bbox}")

        # Add small padding around the plate for better OCR
        pad  = 5
        h, w = img.shape[:2]
        x1   = max(0, x1 - pad)
        y1   = max(0, y1 - pad)
        x2   = min(w, x2 + pad)
        y2   = min(h, y2 + pad)

        cropped = img[y1:y2, x1:x2]
        return cropped

    return None


def preprocess_for_ocr(plate_img):
    """
    Preprocess cropped plate image for better OCR accuracy.
    Steps: resize → grayscale → denoise → threshold
    """
    # Resize to standard height for consistent OCR
    target_h = 64
    h, w     = plate_img.shape[:2]
    scale    = target_h / h
    resized  = cv2.resize(plate_img, (int(w * scale), target_h))

    # Grayscale
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10)

    # Adaptive threshold — works better than fixed threshold
    # for varying lighting conditions (outdoor parking)
    thresh = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    return thresh


def read_plate_text(plate_img):
    """
    Run EasyOCR on preprocessed plate image.
    Cleans result to keep only alphanumeric characters.
    Returns plate string like 'MH12AB1234' or None.
    """
    processed = preprocess_for_ocr(plate_img)
    results   = ocr_reader.readtext(processed, detail=1)

    if not results:
        log.warning("EasyOCR: No text detected")
        return None

    # Combine all detected text segments
    full_text = " ".join([res[1] for res in results])
    log.info(f"EasyOCR raw result: {full_text}")

    # Clean — keep only uppercase alphanumeric characters
    cleaned = re.sub(r'[^A-Z0-9]', '', full_text.upper())

    if len(cleaned) < 4:
        # Too short to be a valid plate
        log.warning(f"EasyOCR: Result too short to be valid plate: '{cleaned}'")
        return None

    log.info(f"EasyOCR cleaned plate: {cleaned}")
    return cleaned


# ============================================================
# POST /upload?lane=entry OR /upload?lane=exit
# Called by ESP32-CAM Arduino code
# ============================================================
@app.post("/upload")
async def upload_image(
    lane:  str        = Query(..., description="entry or exit"),
    image: UploadFile = File(...)
):
    """
    Main endpoint called by ESP32-CAM.

    Query param:
        lane = "entry" or "exit"

    Body:
        Multipart JPEG image file

    Returns:
        {"status": "entry", "plate": "MH12AB1234"}
        {"status": "exit",  "plate": "MH12AB1234"}
        {"status": "error", "message": "..."}
    """
    log.info(f"=== /upload called  lane={lane} ===")

    # Validate lane parameter
    if lane not in ("entry", "exit"):
        raise HTTPException(status_code=400, detail="lane must be 'entry' or 'exit'")

    # ── Read image bytes ──────────────────────────────────
    image_bytes = await image.read()
    log.info(f"Image received: {len(image_bytes)} bytes")

    if len(image_bytes) < 1000:
        log.error("Image too small — likely corrupt")
        return {"status": "error", "message": "Image too small or corrupt"}

    # Save image for debugging (optional)
    timestamp    = datetime.now().strftime("%Y%m%d_%H%M%S")
    debug_path   = f"captured_images/{lane}_{timestamp}.jpg"
    os.makedirs("captured_images", exist_ok=True)
    with open(debug_path, "wb") as f:
        f.write(image_bytes)

    # ── Decode image ──────────────────────────────────────
    img = decode_image(image_bytes)
    if img is None:
        log.error("Failed to decode image")
        return {"status": "error", "message": "Failed to decode image"}

    # ── YOLO plate detection ──────────────────────────────
    plate_crop = detect_plate(img)
    if plate_crop is None:
        return {"status": "error", "message": "No plate detected in image"}

    # ── EasyOCR plate text reading ────────────────────────
    plate_text = read_plate_text(plate_crop)
    if plate_text is None:
        return {"status": "error", "message": "Could not read plate text"}

    # ── Read current Google Sheet records ─────────────────
    records = sheets_read()
    now     = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if lane == "entry":
        # Check if this plate is already inside
        already_inside = any(
            r.get("Plate Number") == plate_text and r.get("Status") == "ENTERED"
            for r in records
        )
        if already_inside:
            log.warning(f"Plate {plate_text} already inside — ignoring duplicate entry")
            return {"status": "error", "message": f"{plate_text} already inside"}

        # Assign next free slot
        slot = assign_slot(records)
        if slot is None:
            log.warning("Parking lot is full!")
            return {"status": "error", "message": "Parking lot full"}

        # Append new entry row to Google Sheet
        # Columns: Plate Number | Slot | Status | Entry Time | Exit Time
        success = sheets_append_row([plate_text, slot, "ENTERED", now, "-"])
        if not success:
            return {"status": "error", "message": "Failed to write to Google Sheets"}

        log.info(f"ENTRY recorded: {plate_text}  slot={slot}  time={now}")
        return {"status": "entry", "plate": plate_text, "slot": slot}

    else:  # lane == "exit"
        # Find matching ENTERED record for this plate
        matching_row = None
        for i, r in enumerate(records):
            if r.get("Plate Number") == plate_text and r.get("Status") == "ENTERED":
                matching_row = (i, r)
                break

        if matching_row is None:
            log.warning(f"Plate {plate_text} not found in parking records")
            return {"status": "error", "message": f"{plate_text} not found in records"}

        row_index, record = matching_row

        # Google Sheets row number:
        # Row 1 = headers, data starts at row 2
        # records list is 0-indexed, so add 2
        sheet_row = row_index + 2

        # Update Status column (column C) and Exit Time column (column E)
        sheets_update_cell(sheet_row, "C", "EXITED")
        sheets_update_cell(sheet_row, "E", now)

        log.info(f"EXIT recorded: {plate_text}  row={sheet_row}  time={now}")
        return {"status": "exit", "plate": plate_text}


# ============================================================
# GET /parking-status
# Called by React frontend every 2 seconds
# ============================================================
@app.get("/parking-status")
async def get_status():
    """
    Returns all parking records from Google Sheets.
    React frontend polls this every 2 seconds.
    """
    records = sheets_read()
    log.info(f"Frontend poll: {len(records)} records returned")
    return records


# ============================================================
# GET /health
# Open in browser to verify server is running
# ============================================================
@app.get("/health")
async def health():
    return {
        "status":       "ok",
        "yolo_loaded":  yolo_model is not None,
        "ocr_loaded":   ocr_reader is not None,
        "sheet_id":     SHEET_ID,
        "total_slots":  TOTAL_SLOTS,
    }


# ============================================================
# Entry point
# ============================================================
if __name__ == "__main__":
    import uvicorn
    log.info("Starting Smart Parking FastAPI server...")
    log.info(f"Weights path: {WEIGHTS_PATH}")
    uvicorn.run(app, host="0.0.0.0", port=8000)