with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(1997, 2004):
    print(f"Line {j}: {lines[j].rstrip()}")
