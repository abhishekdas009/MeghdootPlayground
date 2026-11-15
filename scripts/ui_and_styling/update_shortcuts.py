import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '{ id: "17", name: "DUE DATE FIX", icon: "CalendarClock" }'
replacement = '{ id: "4", name: "CASE ASSIGN", icon: "Users" }'

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Updated shortcuts array.")
else:
    print("Target not found.")
