with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = -1
for i, line in enumerate(lines):
    if "function QueryPreviewCard" in line:
        start = i
        break

if start != -1:
    end = min(start + 120, len(lines))
    for i in range(start + 50, end):
        print(f"Line {i+1}: {lines[i].rstrip()}")
