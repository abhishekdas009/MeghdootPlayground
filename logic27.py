with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "export default function SOQLGenerator()" in line:
        for j in range(i, len(lines)):
            if "return (" in lines[j]:
                for k in range(j, j+40):
                    print(lines[k].rstrip())
                break
        break
