with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "shortcut.icon === \"Database\"" in line:
        for j in range(i-5, i+5):
            print(lines[j].rstrip())
        break
