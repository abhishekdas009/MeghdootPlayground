with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isCaseAssign && (" in line:
        for j in range(i, i+150):
            if "</motion.div>" in lines[j]:
                print(f"Line {j}: {lines[j].strip()}")
                print(f"Next Line {j+1}: {lines[j+1].strip()}")
                print(f"Next Line {j+2}: {lines[j+2].strip()}")
                break
        break
