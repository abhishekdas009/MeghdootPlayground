import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of the dark gradient
content = content.replace('dark:from-white/30 dark:to-transparent', 'dark:from-white/50 dark:to-white/10')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermark gradients to be more 'white to light' in dark mode")
