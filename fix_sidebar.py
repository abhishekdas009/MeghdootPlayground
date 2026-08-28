import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0"'
replacement = 'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col h-full min-h-0"'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added flex to sidebar")
else:
    print("Failed")
