import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<CardTitle className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight flex-1">'
replacement = '<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight flex-1">'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Changed mt-2 md:mt-3 to mt-5 md:mt-6 for STEP 1")
else:
    print("Failed to find target")
