with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "hydrateFromServer" in line or "fetch" in line or "useEffect" in line:
        for j in range(max(0, i-2), i+5):
            print(f"Line {j}: {lines[j].rstrip()}")
        print("---")
