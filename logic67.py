with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "Drag & Drop your" in line or "Drag & Drop" in line:
            print(f"Line {i}: {line.strip()}")
