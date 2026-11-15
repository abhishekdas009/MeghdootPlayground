with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const toggleTheme = ()" in line:
        pass
    elif "onClick={toggleTheme}" in line:
        for j in range(max(0, i-5), i+5):
            print(f"Line {j}: {lines[j].strip()}")
        break
