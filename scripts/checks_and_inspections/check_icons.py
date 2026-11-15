import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if "from \"lucide-react\"" in line:
            break
        if i > 10 and i < 40:
            print(line.strip())
