with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for line in f:
        if "Paste CSV from Salesforce Inspector here" in line:
            print(line.strip())
