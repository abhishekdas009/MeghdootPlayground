with open("frontend/lib/dashboard-store.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "persist" in line:
        print(f"Line {i}: {line.strip()}")
