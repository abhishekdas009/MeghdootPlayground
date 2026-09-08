with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
print(f"Total lines: {len(lines)}")
for i in range(min(5, len(lines))):
    print(f"Line {i}: {len(lines[i])} chars")
