import requests
import os
import time

SERVER     = "http://127.0.0.1:8000"
IMAGES_DIR = r"E:\tPBL\parking_system\model\test_images"

def upload(path, lane):
    with open(path, "rb") as f:
        response = requests.post(
            f"{SERVER}/upload?lane={lane}",
            files={"image": ("test.jpg", f, "image/jpeg")}
        )
    return response.json()

def get_records():
    response = requests.get(f"{SERVER}/records")
    records  = response.json()["records"]
    print(f"\nTotal records in Excel: {len(records)}")
    for r in records:
        print(f"  {r}")

if __name__ == "__main__":

    test_images = [
        r"E:\tPBL\parking_system\model\test_images\mycar1.jpg",
        r"E:\tPBL\parking_system\model\test_images\mycar2.jpg",
        r"E:\tPBL\parking_system\model\test_images\mycar3.jpg",
        r"E:\tPBL\parking_system\model\test_images\mycar4.jpg",
        r"E:\tPBL\parking_system\model\test_images\mycar5.jpg",
    ]

    print(f"Testing with {len(test_images)} cars\n")

    print("--- ENTRY ---")
    for i, img in enumerate(test_images):
        result = upload(img, "entry")
        print(f"Car {i+1} ({os.path.basename(img)}): {result}")
        time.sleep(0.5)

    get_records()

    print("\n--- EXIT ---")
    for i, img in enumerate(test_images):
        result = upload(img, "exit")
        print(f"Car {i+1} ({os.path.basename(img)}): {result}")
        time.sleep(0.5)

    get_records()