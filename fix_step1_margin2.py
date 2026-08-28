import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<CardTitle className="mt-8 md:mt-12 text-lg md:text-xl font-black tracking-tight leading-tight flex-1">'
replacement = '<CardTitle className="mt-12 md:mt-16 text-lg md:text-xl font-black tracking-tight leading-tight flex-1">'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Increased top margin to mt-12 md:mt-16 for STEP 1 title")
else:
    print("Failed")
