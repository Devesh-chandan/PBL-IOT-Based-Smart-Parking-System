


import pandas as pd
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
API_KEY = "AIzaSyDB-bZ4E1EK4tjn5-mTGldgdIk8ASN6JFI"
SHEET_ID = "12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk"
SHEET_NAME = "Sheet1" 

@app.get("/parking-status")
async def get_status():
    try:
        url = f"https://sheets.googleapis.com/v4/spreadsheets/12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk/values/Sheet1?key=AIzaSyDB-bZ4E1EK4tjn5-mTGldgdIk8ASN6JFI"
        response = requests.get(url)
        res_data = response.json()

        # Check if Google returned an error (e.g. Sheet name wrong or API key blocked)
        if "error" in res_data:
            print(f"❌ GOOGLE ERROR: {res_data['error']['message']}")
            return [] # Return empty list so React doesn't crash

        if "values" not in res_data:
            print("⚠️ No data found in the sheet.")
            return []

        values = res_data["values"]
        if len(values) < 1:
            return []

        headers = values[0]
        rows = values[1:]
        
        # Convert list of lists to list of objects
        data = []
        for row in rows:
            entry = {}
            for i, header in enumerate(headers):
                # If a cell is empty, use "-"
                entry[header] = row[i] if i < len(row) else "-"
            data.append(entry)

        print(f"✅ Success: Fetched {len(data)} rows")
        return data

    except Exception as e:
        print(f"💥 System Error: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



import pandas as pd
import os
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_FILE = "parking_log.xlsx"

# Initialize Excel file if it doesn't exist
if not os.path.exists(EXCEL_FILE):
    df = pd.DataFrame(columns=['Plate Number', 'Status', 'Entry Time', 'Slot'])
    df.to_excel(EXCEL_FILE, index=False)

@app.post("/upload")
async def upload_and_detect(lane: str = Query(...), image: UploadFile = File(...)):
    """
    Endpoint for the ML Model. 
    In a real scenario, you'd run your YOLO detection here.
    """
    # 1. Save temp image and run ML detection
    # (Assuming your ML model extracts 'plate_number')
    detected_plate = "MH12AB1234" # Placeholder for actual ML result
    
    # 2. Update Excel logic
    df = pd.read_excel(EXCEL_FILE)
    
    new_entry = {
        'Plate Number': detected_plate,
        'Status': 'ENTERED' if lane == "entry" else 'EXITED',
        'Entry Time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'Slot': len(df[df['Status'] == 'ENTERED']) + 1 if lane == "entry" else "-"
    }
    
    df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
    df.to_excel(EXCEL_FILE, index=False)
    
    return {"status": "success", "plate": detected_plate}

@app.get("/parking-status")
async def get_status():
    """
    Endpoint for the React Frontend.
    Reads the Excel file and returns JSON.
    """
    try:
        if not os.path.exists(EXCEL_FILE):
            return []
            
        df = pd.read_excel(EXCEL_FILE)
        # Convert NaN/empty values to "-" for the frontend
        df = df.fillna("-")
        
        # Convert dataframe to list of dictionaries
        data = df.to_dict(orient="records")
        return data
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



# import pandas as pd
# import os
# from datetime import datetime
# from fastapi import FastAPI, UploadFile, File, Query
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# EXCEL_FILE = "parking_log.xlsx"
# TOTAL_SLOTS = 20

# # Initialize Excel file if it doesn't exist
# if not os.path.exists(EXCEL_FILE):
#     df = pd.DataFrame(columns=['Plate Number', 'Status', 'Entry Time', 'Slot'])
#     df.to_excel(EXCEL_FILE, index=False)

# def get_next_available_slot(df):
#     # Get the latest record for every plate to see who is currently 'ENTERED'
#     if df.empty:
#         return 1
    
#     # Get only the most recent status for each car
#     latest = df.sort_values('Entry Time').groupby('Plate Number').last()
#     occupied_slots = latest[latest['Status'] == 'ENTERED']['Slot'].tolist()
    
#     # Find the first number between 1 and 20 not in occupied_slots
#     for i in range(1, TOTAL_SLOTS + 1):
#         if i not in occupied_slots:
#             return i
#     return "-" # Full

# @app.post("/upload")
# async def upload_and_detect(lane: str = Query(...), image: UploadFile = File(...)):
#     # Placeholder: In your real script, integrate your YOLO detection here
#     # Example: detected_plate = run_yolo(image)
#     detected_plate = "MH12AB1234" 
    
#     # df = pd.read_excel(EXCEL_FILE)
#     df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
    
#     if lane == "entry":
#         slot = get_next_available_slot(df)
#         status = "ENTERED"
#     else:
#         # For exit, find which slot the car was in
#         latest_car_record = df[df['Plate Number'] == detected_plate].last_valid_index()
#         slot = "-"
#         status = "EXITED"

#     new_entry = {
#         'Plate Number': detected_plate,
#         'Status': status,
#         'Entry Time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#         'Slot': slot
#     }
    
#     df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
#     df.to_excel(EXCEL_FILE, index=False)
    
#     return {"status": "success", "plate": detected_plate, "slot": slot}

# @app.get("/parking-status")
# async def get_status():
#     try:
#         if not os.path.exists(EXCEL_FILE):
#             return []
#         df = pd.read_excel(EXCEL_FILE)
#         df = df.fillna("-")
#         return df.to_dict(orient="records")
#     except Exception as e:
#         print(f"Error: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)