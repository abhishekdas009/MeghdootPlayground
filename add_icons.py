import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add icons to lucide-react import
content = content.replace('import {', 'import { FileWarning, CalendarClock, Database,', 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added icons')
