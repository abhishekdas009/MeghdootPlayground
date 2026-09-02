with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "function transformChildDetailsToParent" in line or "const transformChildDetailsToParent" in line:
        for j in range(max(0, i-2), i+40):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
