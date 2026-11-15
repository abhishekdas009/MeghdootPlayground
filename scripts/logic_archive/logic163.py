with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Paste ticket numbers here" in line and "Textarea" in lines[i-1]:
        for j in range(max(0, i-10), i+20):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
