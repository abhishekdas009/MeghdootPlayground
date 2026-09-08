with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "getStats" in line or "setStats" in line:
        print(f"Line {i}: {line.strip()}")
