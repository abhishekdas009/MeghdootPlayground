with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    print(f"Line {i+1}: {line.rstrip()}")
