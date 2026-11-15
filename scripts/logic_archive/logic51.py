with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "<textarea" in line:
            print(f"Line {i}: {line.strip()}")
            print(f"Next: {next(f).strip()}")
