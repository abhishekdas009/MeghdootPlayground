import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports_to_add = "    FileWarning,\n    ArrowRightLeft,\n    CalendarClock,\n    Database,"
content = content.replace("} from \"lucide-react\";", imports_to_add + "\n} from \"lucide-react\";")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
