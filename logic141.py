with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "id: \"2\"" in line:
        for j in range(i-5, i+20):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
