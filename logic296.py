with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "You're all caught up" in line or "activity.length === 0" in line:
        for j in range(max(0, i-5), i+15):
            print(f"Line {j}: {lines[j].strip()}")
        break
