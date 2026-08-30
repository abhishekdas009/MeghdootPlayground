with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(1320, 1335):
    print(lines[i].rstrip())
