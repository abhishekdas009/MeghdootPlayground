with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    for line in f:
        if "isSA" in line and "<" in line:
            print(line.strip())
