with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "SELECT " in line and "FROM Asset" in line:
        print(f"Line {i}: {line.strip()}")
