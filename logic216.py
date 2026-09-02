with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function transformChildDetailsToParent" in line:
        for j in range(i, i+150):
            if "buildCSVRow" in lines[j] or "outputRows.push" in lines[j]:
                print(f"Line {j}: {lines[j].rstrip()}")
        break
