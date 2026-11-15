import sys

with open("frontend/app/globals.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if ".app-card:hover," in line and ".glass-panel:hover {" in lines[i+1]:
        # This is the rogue block at line 599
        skip = True
    if skip and "}" in line:
        skip = False
        continue
    
    if not skip:
        new_lines.append(line)

with open("frontend/app/globals.css", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Success")
