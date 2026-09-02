with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "name: \"CHILD TO PARENT UPDATED\"" in line:
        for j in range(max(0, i-2), i+15):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
