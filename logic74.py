with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const baseShortcuts" in line:
        for j in range(i, i+30):
            print(lines[j].rstrip())
        break
