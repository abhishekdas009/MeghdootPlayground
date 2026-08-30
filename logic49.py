with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "placeholder=\"Paste CSV from Salesforce Inspector here...\"" in line:
        for j in range(i-2, i+5):
            print(lines[j].rstrip())
        break
