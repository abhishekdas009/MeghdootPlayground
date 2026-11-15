with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const defaultTemplates: Template[] =" in line:
        for j in range(i, i+150):
            if 'id: "2"' in lines[j]:
                for k in range(j-3, j+15):
                    print(f"Line {k}: {lines[k].rstrip()}")
                break
