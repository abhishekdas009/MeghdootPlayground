with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(411, 424):
    print(lines[i].rstrip())
