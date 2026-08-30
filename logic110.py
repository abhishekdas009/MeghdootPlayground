with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for j in range(3545, 3590):
    print(f"Line {j}: {lines[j].rstrip()}")
