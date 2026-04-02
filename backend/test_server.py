# import requests
# import os
# import time

# SERVER     = "http://127.0.0.1:8000"
# IMAGES_DIR = r"E:\tPBL\parking_system\model\test_images"

# def upload(path, lane):
#     with open(path, "rb") as f:
#         response = requests.post(
#             f"{SERVER}/upload?lane={lane}",
#             files={"image": ("test.jpg", f, "image/jpeg")}
#         )
#     return response.json()

# def get_records():
#     response = requests.get(f"{SERVER}/records")
#     records  = response.json()["records"]
#     print(f"\nTotal records in Excel: {len(records)}")
#     for r in records:
#         print(f"  {r}")

# if __name__ == "__main__":

#     test_images = [
#         r"E:\tPBL\parking_system\model\test_images\mycar1.jpg",
#         r"E:\tPBL\parking_system\model\test_images\mycar2.jpg",
#         r"E:\tPBL\parking_system\model\test_images\mycar3.jpg",
#         r"E:\tPBL\parking_system\model\test_images\mycar4.jpg",
#         r"E:\tPBL\parking_system\model\test_images\mycar5.jpg",
#     ]

#     print(f"Testing with {len(test_images)} cars\n")

#     print("--- ENTRY ---")
#     for i, img in enumerate(test_images):
#         result = upload(img, "entry")
#         print(f"Car {i+1} ({os.path.basename(img)}): {result}")
#         time.sleep(0.5)

#     get_records()

#     print("\n--- EXIT ---")
#     for i, img in enumerate(test_images):
#         result = upload(img, "exit")
#         print(f"Car {i+1} ({os.path.basename(img)}): {result}")
#         time.sleep(0.5)

#     get_records()



from ultralytics import YOLO
import cv2
import requests
import os

def run_detection_and_send(image_path, lane="entry"):
    # 1. Load your trained model
    model = YOLO("weights/best.pt")

    # 2. Run Inference
    results = model(image_path, conf=0.5)

    for r in results:
        if len(r.boxes) > 0:
            print(f"✅ Plate detected in {os.path.basename(image_path)}")
            
            # 3. Send image to Backend
            api_url = f"http://127.0.0.1:8000/upload?lane={lane}"
            try:
                with open(image_path, 'rb') as f:
                    files = {'image': (os.path.basename(image_path), f, 'image/jpeg')}
                    response = requests.post(api_url, files=files)
                
                print(f"Backend Response: {response.json()}")
                
                # Optional: Save the annotated image locally
                annotated = r.plot()
                cv2.imwrite("last_detection.jpg", annotated)
                
            except Exception as e:
                print(f"❌ Failed to connect to backend: {e}")
        else:
            print("No plate found.")

if __name__ == "__main__":
    # Test with one of your images
    test_img = r"E:\tPBL\parking_system\model\test_images\mycar1.jpg"
    run_detection_and_send(test_img, lane="entry")