with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(3260, 3310):
    print(lines[i].rstrip())
