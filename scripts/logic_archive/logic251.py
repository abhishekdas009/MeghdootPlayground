with open("frontend/app/formula-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "trackDashboardEvent" in line or "dashboardStore" in line:
        print(f"Line {i}: {line.strip()}")
