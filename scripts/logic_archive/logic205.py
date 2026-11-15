with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(141, len(lines)):
    try:
        print(f"Line {i+1}: {lines[i].rstrip()}")
    except Exception:
        pass
