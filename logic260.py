with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const handleSearch" in line:
        print(f"Line {i}: handleSearch found")
        # print first 500 chars of that line
        print(line[:500])
