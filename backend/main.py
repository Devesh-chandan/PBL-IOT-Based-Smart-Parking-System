
# import os
# import pandas as pd
# import time
# import shutil
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# LOG_FILE = "parking_log.xlsx"
# TEMP_FILE = "parking_temp_copy.xlsx"

# @app.get("/parking-status")
# async def get_status():
#     try:
#         if os.path.exists(LOG_FILE):
#             # Create shadow copy to bypass Excel lock
#             shutil.copy2(LOG_FILE, TEMP_FILE)
            
#             # Read the file
#             df = pd.read_excel(TEMP_FILE, engine='openpyxl')
            
#             # This handles the empty cells
#             df = df.fillna("-")
            
#             # Convert to list of dictionaries
#             data = df.to_dict(orient="records")
            
#             # DEBUG: This will show you in the terminal what Python sees
#             if len(data) > 0:
#                 print(f"Read Success: Row 1 Plate is {data[0].get('Plate Number')}")
                
#             return data
#         return []
#     except Exception as e:
#         print(f"Error reading Excel: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)



# import os
# import pandas as pd
# import time
# import shutil
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# LOG_FILE = "parking_log.xlsx"
# TEMP_FILE = "parking_ui_copy.xlsx"

# @app.get("/parking-status")
# async def get_status():
#     try:
#         if not os.path.exists(LOG_FILE):
#             print("Excel file not found!")
#             return []

#         # Force a fresh copy every single time the frontend asks
#         # We use a short sleep to wait out any OS 'write-locks'
#         try:
#             shutil.copy2(LOG_FILE, TEMP_FILE)
#         except PermissionError:
#             time.sleep(0.1) # Wait 100ms if Excel is currently 'writing' the save
#             shutil.copy2(LOG_FILE, TEMP_FILE)

#         df = pd.read_excel(TEMP_FILE, engine='openpyxl')
#         df = df.fillna("-")
        
#         # Log to terminal so you can see if Python 'sees' your edit
#         data = df.to_dict(orient="records")
#         if data:
#             print(f"Update Detected: Row 1 Status is now '{data[0].get('Status')}'")
            
#         return data
#     except Exception as e:
#         print(f"Backend Sync Error: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


# import os
# import pandas as pd
# import io
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# LOG_FILE = "parking_log.xlsx"

# @app.get("/parking-status")
# async def get_status():
#     try:
#         if not os.path.exists(LOG_FILE):
#             return []

#         # NEW LOGIC: Read the file as a binary stream
#         # This bypasses many 'File in Use' locks that shutil can't handle
#         with open(LOG_FILE, "rb") as f:
#             file_content = f.read()
            
#         # Wrap the binary content in a BytesIO object for pandas
#         df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
#         df = df.fillna("-")
        
#         data = df.to_dict(orient="records")
        
#         # MONITOR THIS: Does this print the NEW text in your terminal?
#         if data:
#             print(f"DEBUG: Read successful. First row Plate: {data[0].get('Plate Number')}")
            
#         return data
#     except Exception as e:
#         print(f"Read Error: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


# import pandas as pd
# import requests
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- CONFIGURATION ---
# API_KEY = "AIzaSyDB-bZ4E1EK4tjn5-mTGldgdIk8ASN6JFI"
# SHEET_ID = "1abc123_YOUR_ACTUAL_ID_HERE_456xyz"
# SHEET_NAME = "database" # Change if your tab name is different

# @app.get("/parking-status")
# async def get_status():
#     try:
#         # Construct the Google Sheets API URL
#         url = f"https://docs.google.com/spreadsheets/d/12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk/edit?usp=sharing"
        
#         response = requests.get(url)
#         res_data = response.json()
        
#         if "values" not in res_data:
#             return {"error": "No data found in sheet"}

#         # Convert Google Sheets list format to Pandas DataFrame
#         values = res_data["values"]
#         headers = values[0]  # First row is headers
#         rows = values[1:]    # Remaining rows are data
        
#         df = pd.DataFrame(rows, columns=headers)
#         df = df.fillna("-")
        
#         data = df.to_dict(orient="records")
#         print(f"--- Google Sheets Sync: {len(data)} rows fetched ---")
#         return data

#     except Exception as e:
#         print(f"Google API Error: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


# import pandas as pd
# import requests
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- CONFIGURATION ---
# API_KEY = "AIzaSyDB-bZ4E1EK4tjn5-mTGldgdIk8ASN6JFI"
# # This is the ID extracted from your URL
# SHEET_ID = "12PyHepmlsAW-k39XXHcykDLnKOTwd5TcUBJZzFbWFTk"
# SHEET_NAME = "database" 

# @app.get("/parking-status")
# async def get_status():
#     try:
#         # CORRECT API URL FORMAT:
#         url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET_NAME}?key={API_KEY}"
        
#         response = requests.get(url)
#         res_data = response.json()
        
#         # Error handling if the API returns an error message
#         if "error" in res_data:
#             print(f"Google API Error: {res_data['error']['message']}")
#             return {"error": res_data['error']['message']}

#         if "values" not in res_data:
#             return []

#         # Convert to list of dicts
#         values = res_data["values"]
#         headers = values[0]
#         rows = values[1:]
        
#         df = pd.DataFrame(rows, columns=headers)
#         df = df.fillna("-")
        
#         data = df.to_dict(orient="records")
#         print(f"--- Google Sheets Sync: {len(data)} rows fetched ---")
#         return data

#     except Exception as e:
#         print(f"System Error: {e}")
#         return []

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)



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