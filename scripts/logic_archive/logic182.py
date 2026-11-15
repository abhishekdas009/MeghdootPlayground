with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines[:30]):
    print(f"Line {i}: {line.rstrip()}")
