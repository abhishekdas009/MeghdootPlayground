import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'caseOwnerLoadState === "error" ? "Roster offline" :  active owners}'
replacement = 'caseOwnerLoadState === "error" ? "Roster offline" : ${activeCaseOwners.length} active owners}'

content = content.replace(target, replacement)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
