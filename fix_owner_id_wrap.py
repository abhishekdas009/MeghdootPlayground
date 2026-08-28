import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<span className="text-[10px] font-mono text-slate-400">{owner.ownerId}</span>'
replacement = '<span className="text-[10px] font-mono text-slate-400 break-all">{owner.ownerId}</span>'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added break-all for owner ID")
else:
    print("Failed")
