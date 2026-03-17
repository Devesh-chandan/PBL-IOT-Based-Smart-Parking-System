import albumentations as A
import cv2
import os
import shutil

INPUT_IMAGES = "data/images/train"
INPUT_LABELS = "data/labels/train"

transform = A.Compose([
    A.MotionBlur(blur_limit=7, p=0.3),
    A.RandomBrightnessContrast(brightness_limit=0.3, contrast_limit=0.3, p=0.5),
    A.RGBShift(r_shift_limit=15, g_shift_limit=15, b_shift_limit=15, p=0.3),
    A.HorizontalFlip(p=0.5),
    A.GaussNoise(p=0.2),
], bbox_params=A.BboxParams(format="yolo", label_fields=["labels"]))

images = [f for f in os.listdir(INPUT_IMAGES) if f.endswith((".jpg", ".jpeg", ".png"))]

count = 0
for img_file in images:
    img_path   = os.path.join(INPUT_IMAGES, img_file)
    label_path = os.path.join(INPUT_LABELS, img_file.rsplit(".", 1)[0] + ".txt")

    if not os.path.exists(label_path):
        continue

    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    with open(label_path) as f:
        lines = f.read().strip().split("\n")

    bboxes = []
    labels = []
    for line in lines:
        parts = line.split()
        labels.append(int(parts[0]))
        bboxes.append([float(x) for x in parts[1:]])

    # generate 2 augmented versions per image
    for i in range(2):
        augmented = transform(image=img, bboxes=bboxes, labels=labels)
        aug_img   = cv2.cvtColor(augmented["image"], cv2.COLOR_RGB2BGR)
        aug_boxes = augmented["bboxes"]
        aug_labels = augmented["labels"]

        new_name  = img_file.rsplit(".", 1)[0] + f"_aug{i}"
        new_ext   = img_file.rsplit(".", 1)[1]

        cv2.imwrite(f"{INPUT_IMAGES}/{new_name}.{new_ext}", aug_img)

        with open(f"{INPUT_LABELS}/{new_name}.txt", "w") as f:
            for lbl, box in zip(aug_labels, aug_boxes):
                f.write(f"{lbl} {box[0]:.6f} {box[1]:.6f} {box[2]:.6f} {box[3]:.6f}\n")

        count += 1

print(f"Augmentation done. {count} new images added to train set.")