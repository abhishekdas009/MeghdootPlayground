with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "childDetails" in line.lower() or "child_to" in line.lower() or "child to" in line.lower():
        print(f"Line {i}: {line.strip()}")
