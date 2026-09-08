with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for j in range(328, 350):
    print(f"Line {j}: {lines[j].rstrip().encode('utf-8')}")
