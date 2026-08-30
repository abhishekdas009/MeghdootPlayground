with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isTS ?" in line and "2xl:grid-rows-2" in line:
        for j in range(i-5, i+50):
            print(lines[j].rstrip())
        break
