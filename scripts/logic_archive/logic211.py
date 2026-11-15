with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "download" in line.lower() or "export" in line.lower() or "save" in line.lower():
        if "excel" in line.lower() or "csv" in line.lower():
            print(f"Line {i}: {line.strip()}")
