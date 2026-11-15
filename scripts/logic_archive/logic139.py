with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "SA (Service Appointment)" in line or "SA" in line and "template" in line.lower():
        print(f"Found around line {i}")
