with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "PasteResultCard" in line:
        for j in range(i, i+60):
            if "flex flex-wrap items-center gap-3" in lines[j]:
                print(f"Line {j}: {lines[j].strip()}")
        break
