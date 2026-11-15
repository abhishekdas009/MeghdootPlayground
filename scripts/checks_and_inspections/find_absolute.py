with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "absolute top-3 right-4 z-20 flex items-center gap-2 opacity-60 group-hover/glass:opacity-100 transition-opacity duration-300" in line:
        print(f"Match found at line {i+1}")
