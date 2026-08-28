import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 4038: # '            </div>\n' - Wait, zero indexed? Line 4040 is 4039 in 0-indexed if the output above was 1-indexed?
        pass # Let's just find the indices dynamically!

start_idx = -1
for i, line in enumerate(lines):
    if "=== COLUMN 3: ROSTER ===" in line:
        start_idx = i
        break

if start_idx != -1:
    # lines[start_idx] is the comment
    # lines[start_idx - 2] should be </div>
    # lines[start_idx + 1] should be <div className="space-y-4 flex flex-col h-full min-h-0">
    
    # Let's verify
    print("Found at", start_idx)
    print("To delete:", repr(lines[start_idx - 2]))
    print("To delete:", repr(lines[start_idx + 1]))
    
    if "</div>" in lines[start_idx - 2]:
        lines[start_idx - 2] = ""
    if "<div " in lines[start_idx + 1]:
        lines[start_idx + 1] = ""
        
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Success")
else:
    print("Not found")

