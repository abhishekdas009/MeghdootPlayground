with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "CANCELLATION" in line.upper() or "CHILD DETAILS" in line.upper():
            print(f"Line {i}: {line.strip()}")
