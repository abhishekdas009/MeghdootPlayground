import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I previously set it to mt-4 md:mt-5
if "mt-4 md:mt-5" in content:
    content = content.replace(
        '<div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-4 md:mt-5">',
        '<div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">'
    )
    print("Success: Changed mt-4 md:mt-5 to mt-2 md:mt-3")
else:
    print("Not found mt-4 md:mt-5")

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
