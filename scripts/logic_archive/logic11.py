with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function TemplatePicker(" in line:
        for j in range(i, i+150):
            if "return (" in lines[j]:
                for k in range(j, j+20):
                    print(lines[k].strip())
                break
        break
