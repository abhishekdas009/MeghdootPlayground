with open("frontend/app/analytics/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const generateMockChartData" in line or "const chartData" in line:
        for j in range(max(0, i-2), i+20):
            print(f"Line {j}: {lines[j].rstrip()}")
        print("---")
