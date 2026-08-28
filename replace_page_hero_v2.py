import os
import re

files = [
    "frontend/app/analytics/page.tsx",
    "frontend/app/dashboard/page.tsx",
    "frontend/app/formula-generator/page.tsx",
    "frontend/app/help/page.tsx",
    "frontend/app/history/page.tsx",
    "frontend/app/soql-generator/page.tsx",
    "frontend/app/template-manager/page.tsx",
    "frontend/app/ticket-formatter/page.tsx"
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the tag with className="page-hero"
    match = re.search(r'<(div|motion\.div)[^>]*?className="page-hero[^"]*"[^>]*?>', content)
    if not match:
        continue
        
    tag_name = match.group(1)
    tag_start = match.start()
    tag_end = match.end()
    
    # We need to find the matching closing tag
    stack = 0
    end_idx = -1
    i = tag_start
    while i < len(content):
        if content.startswith(f'<{tag_name}', i) and (content[i+len(tag_name)+1] in [' ', '>', '\n']):
            stack += 1
            i += len(tag_name) + 1
        elif content.startswith(f'</{tag_name}>', i):
            stack -= 1
            if stack == 0:
                end_idx = i
                break
            i += len(tag_name) + 3
        else:
            i += 1
            
    if end_idx != -1:
        # Add import
        if 'HoverTiltCard' not in content:
            import_stmt = 'import { HoverTiltCard } from "@/components/ui/hover-tilt-card";\n'
            content = re.sub(r'^(import .*?;\n)(?!import)', r'\1' + import_stmt, content, count=1, flags=re.MULTILINE)
            # Adjust indices since we added content
            tag_start += len(import_stmt)
            tag_end += len(import_stmt)
            end_idx += len(import_stmt)
            
        opening = content[tag_start:tag_end]
        new_opening = opening.replace(f'<{tag_name}', '<HoverTiltCard')
        
        # We need to remove the "page-hero" string from className to avoid duplicate class names
        new_opening = new_opening.replace('page-hero ', '')
        
        content = content[:end_idx] + '</HoverTiltCard>' + content[end_idx+len(tag_name)+3:]
        content = content[:tag_start] + new_opening + content[tag_end:]
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Failed to find closing tag in {file}")

print("Done")
