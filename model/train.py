from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("yolov8s.pt")

    results = model.train(
        data     = "dataset.yaml",
        epochs   = 50,
        imgsz    = 640,
        batch    = 4,
        workers  = 2,
        patience = 10,
        name     = "plate_detector",
        plots    = True
    )

    print("Training done. Best weights saved to runs/detect/plate_detector/weights/best.pt")