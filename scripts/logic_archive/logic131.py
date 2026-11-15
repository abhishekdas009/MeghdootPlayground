with open("frontend/app/api/warranty-finder/upload/route.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "prisma.warrantyCondition.createMany({" in line:
        for j in range(i, i+20):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
