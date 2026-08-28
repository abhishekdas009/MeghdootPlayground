import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '{isCaseAssign && (\n                      <div className="flex flex-col space-y-4">'
replacement = '{isCaseAssign && (\n                      <div className="flex flex-col space-y-4 flex-1 min-h-0 h-full">'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added flex to drag zone wrapper")
else:
    print("Failed")
