import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicate ArrowRightLeft
content = content.replace('    ArrowRightLeft,\n    CalendarClock,', '    CalendarClock,')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
