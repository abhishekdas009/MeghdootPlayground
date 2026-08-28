import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<span className="text-xs font-black text-foreground whitespace-nowrap">{owner.name}</span>'
replacement = '<span className="text-xs font-black text-foreground whitespace-normal break-words">{owner.name}</span>'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Removed whitespace-nowrap and added break-words for owner name")
else:
    print("Failed")
