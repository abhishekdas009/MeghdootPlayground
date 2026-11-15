with open("frontend/components/layout/sidebar.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(240, 275):
    print(f"Line {j}: {lines[j].rstrip()}")
