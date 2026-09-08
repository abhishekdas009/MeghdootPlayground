with open("frontend/app/analytics/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "trendData =" in line or "const trendData" in line:
        for j in range(max(0, i-2), i+15):
            print(f"Line {j}: {lines[j].rstrip().encode('utf-8')}")
        print("---")
