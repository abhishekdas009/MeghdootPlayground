with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const defaultTemplates: Template[] =" in line:
        for j in range(i, i+300):
            print(lines[j].rstrip())
            if "];" in lines[j] and j > i + 10:
                break
        break
