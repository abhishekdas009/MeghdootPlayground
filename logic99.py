with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(3527, 3550):
    print(f"Line {i}: {lines[i].rstrip()}")
