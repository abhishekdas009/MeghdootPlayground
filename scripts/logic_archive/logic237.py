with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "row1Values" in line or "row1TotalValues" in line:
        for j in range(max(0, i-5), i+5):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
