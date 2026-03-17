from ultralytics import YOLO
import cv2
import os

if __name__ == "__main__":
    model = YOLO("weights/best.pt")

    # put any car image path here
    test_image = r"E:\tPBL\parking_system\model\test_images\mycar.jpg"

    results = model(test_image, conf=0.5)

    for r in results:
        if len(r.boxes) == 0:
            print("No plate detected")
        else:
            # draw box on image and save it
            annotated = r.plot()
            cv2.imwrite("test_output.jpg", annotated)
            print(f"Plate detected!")
            print(f"Confidence : {float(r.boxes.conf[0]):.2f}")
            print(f"Bbox       : {r.boxes.xyxy[0].tolist()}")
            print(f"Saved annotated image → test_output.jpg")