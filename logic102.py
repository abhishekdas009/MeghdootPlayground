import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const customChildDetailsProcessor =" in line:
        for j in range(i-5, i+50):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
