with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const isSA" in line or "buildPreviewBatches(\"2\")" in line:
        print(f"Line {i}: {lines[i].strip()}")
