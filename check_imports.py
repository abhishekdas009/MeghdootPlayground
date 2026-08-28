import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    for line in f:
        if "lucide-react" in line:
            print(line.strip())
