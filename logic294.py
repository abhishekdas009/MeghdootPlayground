with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(295, 305):
    print(f"Line {i}: {lines[i].rstrip()}")
