import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\{caseOwnerLoadState === "loading" \? "Roster syncing" : caseOwnerLoadState === "error" \? "Roster offline" : \$\{activeCaseOwners\.length\} active owners\}'
replacement = '{caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : ${activeCaseOwners.length} active owners}'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
