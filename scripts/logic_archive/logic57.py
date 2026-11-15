with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "dynamicShortcuts.map" in line or "dynamicShortcuts.some" in line or "Array.from(favourites)" in line:
        for j in range(i-5, i+30):
            print(lines[j].rstrip())
        break
