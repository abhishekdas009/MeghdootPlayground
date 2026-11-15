with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "POLL_INTERVAL_MS" in line:
        print(f"Line {i}: {line.strip()}")
