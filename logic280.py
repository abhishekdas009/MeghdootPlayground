with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "Model Number" in line or "{result.termName}" in line or "AutocompleteInput" in line:
        print(f"Line {i}: {line.strip()}")
