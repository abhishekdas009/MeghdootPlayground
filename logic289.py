with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "theme" in line.lower() or "dark" in line.lower():
        print(f"Line {i}: {line.strip()}")
