import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isTS && (" in line:
        # find the end of the block
        j = i
        while j < len(lines):
            if "</>" in lines[j] and ")}" in lines[j+1]:
                # Found it
                print(f"Found end at line {j}")
                break
            j += 1
        break
