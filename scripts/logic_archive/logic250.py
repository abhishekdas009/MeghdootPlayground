with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "track" in line.lower() or "record" in line.lower():
        print(f"Line {i}: {line.strip()}")
