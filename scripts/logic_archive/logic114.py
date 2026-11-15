with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "CHILD TO ASSET</CardTitle>" in line:
        for j in range(i-5, i+12):
            print(f"Line {j}: {lines[j].strip()}")
        break
