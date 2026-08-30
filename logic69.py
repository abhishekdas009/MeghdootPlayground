with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "onDragEnter={handleDragEnter}" in line:
        for j in range(i-5, i+40):
            print(lines[j].rstrip())
        break
