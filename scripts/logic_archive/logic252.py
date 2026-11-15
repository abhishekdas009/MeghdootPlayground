with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "trackDashboardEvent" in line or "dashboardStore" in line:
        print(f"Line {i}: {line.strip()}")
