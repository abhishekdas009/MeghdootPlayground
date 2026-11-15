with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const templates: Template[] =" in line or "const defaultTemplates: Template[] =" in line:
        for j in range(i, i+30):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
