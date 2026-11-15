with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(468, 482):
    print(f"Line {j}: {lines[j].rstrip()}")
