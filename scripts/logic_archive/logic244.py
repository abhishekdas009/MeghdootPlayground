with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const kpiRow1 =" in line:
        for j in range(i, i+15):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
