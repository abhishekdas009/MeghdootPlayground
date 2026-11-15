with open("frontend/components/layout/sidebar.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

count = 0
for i, line in enumerate(lines):
    if "alt=\"Meghdoot Logo\"" in line:
        print(f"Found at line {i}")
