from ultralytics import YOLO

if __name__ == "__main__":
    model   = YOLO("weights/best.pt")
    metrics = model.val(data="dataset.yaml")

    print(f"mAP@0.5      : {metrics.box.map50:.4f}")
    print(f"mAP@0.5:0.95 : {metrics.box.map:.4f}")
    print(f"Precision    : {metrics.box.mp:.4f}")
    print(f"Recall       : {metrics.box.mr:.4f}")