import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_fn(match):
    original_classes = match.group(1)
    # Check if we already added it to avoid duplicates
    if "group-hover:translate-x-3" not in original_classes:
        return f'<div className="{original_classes} transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">'
    return match.group(0)

# Pattern to match the div
pattern = r'<div className="(absolute top-\d+ left-\d+ md:top-\d+ md:left-\d+ pointer-events-none select-none z-0 [^"]*)">'
new_content = re.sub(pattern, replace_fn, content)

if new_content != content:
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Added hover animation to watermarks!")
else:
    print("Failed: No replacements made. Please check the regex.")
