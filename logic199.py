with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(25, 40):
    print(f"Line {j}: {lines[j].rstrip()}")
