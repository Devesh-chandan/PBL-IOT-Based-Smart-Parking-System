import os
import re
import cv2
import numpy as np
import easyocr
import logging
import time
import gspread
import google.auth.transport.requests
from google.oauth2.service_account import Credentials
from datetime import datetime
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

CACHED_RECORDS = []
LAST_FETCH_TIME = 0
CACHE_DURATION = 10

load_dotenv()

# ============================================================
# Logging
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("parking_backend.log")]
)
log = logging.getLogger(__name__)

# ============================================================
# Configuration
# ============================================================
SHEET_ID = os.getenv("SHEET_ID", "12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk")
SHEET_NAME = "Sheet1"
TOTAL_SLOTS = 20

# Use raw strings for Windows paths to avoid escape character issues
JSON_KEY_PATH = r"smartparkingsystem-492518-e640bcf2e250.json"
WEIGHTS_PATH = r"..\model\weights\best.pt"

SCOPE = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
CREDS = Credentials.from_service_account_file(JSON_KEY_PATH, scopes=SCOPE)

# Initialize gspread client correctly
def get_sheet():
    try:
        if CREDS.expired:
            CREDS.refresh(google.auth.transport.requests.Request())
        gc = gspread.authorize(CREDS)
        return gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)
    except Exception as e:
        log.error(f"Failed to connect to Google Sheets: {e}")
        raise

# ============================================================
# Load Models
# ============================================================
log.info("Loading YOLO model...")
yolo_model = YOLO(WEIGHTS_PATH)
log.info("Loading EasyOCR...")
ocr_reader = easyocr.Reader(['en'], gpu=False)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Helpers
# ============================================================

def sheets_read():
    global CACHED_RECORDS, LAST_FETCH_TIME
    
    current_time = time.time()
    
    # If 10 seconds haven't passed, return the saved data
    if CACHED_RECORDS and (current_time - LAST_FETCH_TIME < CACHE_DURATION):
        return CACHED_RECORDS

    try:
        log.info("Fetching fresh data from Google Sheets...")
        CACHED_RECORDS = get_sheet().get_all_records()
        LAST_FETCH_TIME = current_time
        return CACHED_RECORDS
    except Exception as e:
        log.error(f"Read error: {e}")
        # If Google blocks us, return the last known good data instead of crashing
        return CACHED_RECORDS

def sheets_append_row(values_list):
    try:
        get_sheet().append_row(values_list, value_input_option='USER_ENTERED')
        return True
    except Exception as e:
        log.error(f"Append error: {e}")
        return False

def sheets_update_cell(row_number, col_letter, value):
    try:
        get_sheet().update_acell(f"{col_letter}{row_number}", value)
        return True
    except Exception as e:
        log.error(f"Update error: {e}")
        return False

def assign_slot(records):
    occupied = {int(r["Slot"]) for r in records if r.get("Status") == "ENTERED" and str(r.get("Slot")).isdigit()}
    for slot in range(1, TOTAL_SLOTS + 1):
        if slot not in occupied:
            return slot
    return None

def detect_plate(img):
    results = yolo_model(img, conf=0.5)
    for r in results:
        if len(r.boxes) == 0: continue
        best_idx = int(r.boxes.conf.argmax())
        x1, y1, x2, y2 = map(int, r.boxes.xyxy[best_idx].tolist())
        return img[max(0, y1-5):y2+5, max(0, x1-5):x2+5]
    return None

def read_plate_text(plate_img):
    gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    results = ocr_reader.readtext(gray)
    if not results: return None
    full_text = "".join([res[1] for res in results]).upper()
    return re.sub(r'[^A-Z0-9]', '', full_text)

# ============================================================
# Endpoints
# ============================================================

@app.post("/upload")
async def upload_image(request: Request):
    image_bytes = await request.body()
    
    log.info(f"Raw Image received: {len(image_bytes)} bytes")

    if len(image_bytes) < 1000:
        return {"status": "error", "message": "Image too small"}

    # --- The rest of your logic remains the same ---
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"status": "error", "message": "Failed to decode"}

    # YOLO and OCR logic...
    plate_crop = detect_plate(img)
    if plate_crop is None:
        return {"status": "error", "message": "No plate detected"}
    
    plate_text = read_plate_text(plate_crop)
    # ---------------------------------------

    if not plate_text:
        return {"status": "error", "message": "OCR could not read text"}

    log.info(f"Detected Plate: {plate_text}")

    # 3. Logic: Entry vs Exit
    records = sheets_read()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    matching_entry = next((i for i, r in enumerate(records) 
                          if r.get("Plate Number") == plate_text and r.get("Status") == "ENTERED"), None)

    if matching_entry is not None:
        # --- EXIT LOGIC ---
        sheet_row = matching_entry + 2
        sheets_update_cell(sheet_row, "C", "EXITED")
        sheets_update_cell(sheet_row, "E", now)
        return {"status": "exit", "plate": plate_text}
    else:
        # --- ENTRY LOGIC ---
        slot = assign_slot(records)
        if slot is None:
            return {"status": "error", "message": "Parking Full"}
        
        sheets_append_row([plate_text, slot, "ENTERED", now, "-"])
        return {"status": "entry", "plate": plate_text, "slot": slot}

@app.get("/parking-status")
async def get_status():
    return sheets_read()

@app.get("/health")
async def health():
    return {"status": "ok", "yolo": True, "ocr": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)