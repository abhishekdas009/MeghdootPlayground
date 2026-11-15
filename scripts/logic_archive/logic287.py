with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "ModeToggle" in line or "Search" in line:
        print(f"Line {i}: {line.strip()}")
