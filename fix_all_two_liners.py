import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">'
replacement = '<div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">'

count = content.count(target)
if count > 0:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Success: Replaced {count} instances.")
else:
    print("Failed: No instances found.")
