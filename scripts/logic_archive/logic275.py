with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "AutocompleteInput" in line and "modelNumber" in line:
        for j in range(max(0, i-5), i+5):
            print(f"Line {j}: {lines[j].rstrip()}")
        break
