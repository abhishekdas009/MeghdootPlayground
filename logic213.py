with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const childDetailsOutput =" in line or "childDetailsOutput = " in line or "childDetailsVisibleResult" in line:
        pass # Actually just search where childDetailsOutput is assigned
    if "childDetailsOutput" in line:
        print(f"Line {i}: {line.strip()}")
