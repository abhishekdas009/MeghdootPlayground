with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(1588, 1630):
    print(f"Line {j}: {lines[j].rstrip().encode('utf-8')}")
