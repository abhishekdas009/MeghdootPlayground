with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(3280, 3300):
    print(f"{i}: {lines[i].rstrip()}")
