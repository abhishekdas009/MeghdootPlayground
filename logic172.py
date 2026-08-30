with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "Meghdoot" in line or "Playground" in line:
            print(f"Header Line {i}: {line.strip()}")

with open("frontend/components/layout/sidebar.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "Meghdoot" in line or "Playground" in line:
            print(f"Sidebar Line {i}: {line.strip()}")
