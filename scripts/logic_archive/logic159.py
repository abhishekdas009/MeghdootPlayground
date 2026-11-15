with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "STEP 1" in line:
        for j in range(max(0, i-5), i+30):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
