with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(190, 230):
    print(f"Line {j}: {lines[j].rstrip()}")
