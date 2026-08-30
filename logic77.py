with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "id: \"20\"" in line:
        for j in range(i-2, i+10):
            print(lines[j].rstrip())
        break
