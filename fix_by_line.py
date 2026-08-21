import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's search for "</div>" followed by "</CardContent>"
# And also find the roster loop to close it properly.

for i, line in enumerate(lines):
    if "</div>" in line and "</CardContent>" in lines[i+1] and "</Card>" in lines[i+2]:
        if "showStats &&" in lines[i+4]: # This is the wrong one!
            print(f"Found wrong one at line {i}")
            # The line is currently                 </div>\n
            # We want to remove it.
            lines[i] = ""

    # Roster list is at ~4466.
    if "))} " in line or "))}" in line:
        # Check if next line is </div> and then </CardContent>
        if "</div>" in lines[i+1] and "</CardContent>" in lines[i+2]:
            print(f"Found roster at line {i}")
            # It currently has one </div>. We need TWO!
            lines[i+1] = lines[i+1].replace("</div>", "</div>\n                    </div>")

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed by line!')
