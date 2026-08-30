with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Paste Ticket result" in line or "PasteResultCard" in line:
        for j in range(max(0, i-5), min(len(lines), i+30)):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
