with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const data = await res.json();" in line:
        for j in range(max(0, i-5), i+15):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
