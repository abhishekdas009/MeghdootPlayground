with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "import" in line and "Template" in line:
            print(f"Line {i}: {line.strip()}")
        if "const templates =" in line or "const baseTemplates" in line or "const defaultTemplates" in line:
            print(f"Line {i}: {line.strip()}")
