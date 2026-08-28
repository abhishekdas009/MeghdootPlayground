import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="mt-2 md:mt-3 text-lg md:text-xl', 'className="mt-4 md:mt-5 text-lg md:text-xl')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Moved all card titles down slightly more")
