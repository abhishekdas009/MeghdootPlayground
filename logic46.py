with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function PasteResultCard(" in line:
        for j in range(i, i+100):
            print(lines[j].rstrip())
        break
