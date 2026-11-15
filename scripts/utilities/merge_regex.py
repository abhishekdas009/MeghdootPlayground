import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Merge Column 2 and Column 3
pattern = r'</Card>\s*</div>\s*/\*\s*=== COLUMN 3: ROSTER ===\s*\*/\s*<div[^>]*>\s*/\*\s*Owner Roster Box\s*\*/'
replacement = '</Card>\n\n            {/* === MERGED COLUMN 3: ROSTER === */}\n            {/* Owner Roster Box */}'

content, count = re.subn(pattern, replacement, content)

if count > 0:
    print(f"Success! Replaced {count} times.")
else:
    print("Failed to replace.")

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

