with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for j in range(3390, 3415):
    print(f"Line {j}: {lines[j].rstrip()}")
