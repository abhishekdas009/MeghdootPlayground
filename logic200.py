with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS" in line:
        print(f"Line {i}: {line.strip()}")
