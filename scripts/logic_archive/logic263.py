with open("frontend/lib/dashboard-store.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "METRIC_KEY_TO_FIELD" in line:
        for j in range(max(0, i-2), i+15):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
