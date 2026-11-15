with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isCaseAssign &&" in line:
        for j in range(i, i+150):
            if "shimmer" in lines[j].lower() or "border" in lines[j].lower() or "animate" in lines[j].lower():
                print(f"Line {j}: {lines[j].strip()}")
