with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(352, 365):
    print(f"Line {j}: {lines[j].rstrip()}")
