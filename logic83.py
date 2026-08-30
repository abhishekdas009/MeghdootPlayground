with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "{isChildDetailsToParent && (" in line:
        for j in range(i, i+150):
            print(lines[j].rstrip())
            if "</motion.div>" in lines[j] or "</Card>" in lines[j]:
                pass
