with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "SELECT" in line.upper() and ("<pre>" in line or "<code>" in line or "whitespace-pre-wrap" in line):
        print(f"Line {i}: {line.strip()}")
    if "Step 2" in line:
        print(f"Line {i}: {line.strip()}")
