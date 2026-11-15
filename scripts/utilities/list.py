import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'id:\s*"([^"]+)",\s*name:\s*"([^"]+)"'
matches = re.findall(pattern, content)
for i, match in enumerate(matches):
    print(f"{i}: id={match[0]} name={match[1]}")
