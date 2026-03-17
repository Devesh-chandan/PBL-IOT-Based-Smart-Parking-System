import os
import xml.etree.ElementTree as ET
import shutil
import random

# ── only change this to where you unzipped the dataset ──
RAW_FOLDER = r"E:\tPBL\parking_system\model\raw_dataset\images" # your actual path
# ────────────────────────────────────────────────────────

pairs = []
for f in os.listdir(RAW_FOLDER):
    if f.lower().endswith((".jpeg", ".jpg", ".png")):
        xml  = os.path.join(RAW_FOLDER, f.rsplit(".", 1)[0] + ".xml")
        img  = os.path.join(RAW_FOLDER, f)
        if os.path.exists(xml):
            pairs.append((img, xml))

print(f"Found {len(pairs)} pairs")

def convert(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    size = root.find("size")
    W = int(size.find("width").text)
    H = int(size.find("height").text)
    lines = []
    for obj in root.iter("object"):
        bb   = obj.find("bndbox")
        xmin = float(bb.find("xmin").text)
        xmax = float(bb.find("xmax").text)
        ymin = float(bb.find("ymin").text)
        ymax = float(bb.find("ymax").text)
        x_center = ((xmin + xmax) / 2) / W
        y_center = ((ymin + ymax) / 2) / H
        width    = (xmax - xmin) / W
        height   = (ymax - ymin) / H
        lines.append(f"0 {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
    return lines

random.seed(42)
random.shuffle(pairs)
n       = len(pairs)
n_train = int(n * 0.8)
n_val   = int(n * 0.1)

splits = {
    "train": pairs[:n_train],
    "val":   pairs[n_train : n_train + n_val],
    "test":  pairs[n_train + n_val:]
}

for split, items in splits.items():
    os.makedirs(f"data/images/{split}", exist_ok=True)
    os.makedirs(f"data/labels/{split}", exist_ok=True)
    for img_path, xml_path in items:
        fname = os.path.basename(img_path).rsplit(".", 1)[0]
        ext   = os.path.basename(img_path).rsplit(".", 1)[1]
        shutil.copy(img_path, f"data/images/{split}/{fname}.{ext}")
        yolo_lines = convert(xml_path)
        with open(f"data/labels/{split}/{fname}.txt", "w") as f:
            f.write("\n".join(yolo_lines))

print(f"Train: {len(splits['train'])} | Val: {len(splits['val'])} | Test: {len(splits['test'])}")
print("data/ folder is ready.")