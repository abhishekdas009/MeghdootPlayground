import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="mt-4 md:mt-5', 'className="mt-5 md:mt-6')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated margin for all Card Titles")
