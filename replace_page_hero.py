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

    # Add import if not exists
    if 'HoverTiltCard' not in content:
        import_stmt = 'import { HoverTiltCard } from "@/components/ui/hover-tilt-card";\n'
        # Add after the first import block
        content = re.sub(r'^(import .*?;\n)(?!import)', r'\1' + import_stmt, content, count=1, flags=re.MULTILINE)

    # Replace <div className="page-hero ..."> with <HoverTiltCard className="...">
    # We need to find the opening div, and its corresponding closing div.
    # Since regex is hard for nested divs, let's just replace the exact line for the opening div,
    # and then manually replace the closing div that matches that block.
    
    # Actually, a simpler approach: 
    # find <div className="page-hero" or similar
    # Replace `<div className="page-hero` with `<HoverTiltCard className="page-hero`
    
    # Let's see the exact matches
    pattern = r'<div(\s+className="page-hero[^"]*")>'
    
    # wait, sometimes it is broken across lines:
    # <div
    #   className="page-hero ..."
    # >
    
    # Let's just find the index of 'className="page-hero'
    idx = content.find('className="page-hero')
    if idx == -1:
        continue
        
    # find the preceding '<div'
    div_idx = content.rfind('<div', 0, idx)
    # find the closing '>'
    close_idx = content.find('>', idx)
    
    if div_idx != -1 and close_idx != -1:
        # We need to find the matching closing </div>
        # A simple stack-based parser to find the matching </div>
        stack = 0
        end_idx = -1
        i = div_idx
        while i < len(content):
            if content[i:i+4] == '<div':
                stack += 1
                i += 4
            elif content[i:i+6] == '</div>':
                stack -= 1
                if stack == 0:
                    end_idx = i
                    break
                i += 6
            else:
                i += 1
                
        if end_idx != -1:
            # Replace opening
            opening = content[div_idx:close_idx+1]
            new_opening = opening.replace('<div', '<HoverTiltCard')
            
            # Replace closing
            content = content[:end_idx] + '</HoverTiltCard>' + content[end_idx+6:]
            content = content[:div_idx] + new_opening + content[div_idx+len(opening):]
            
            # Remove "page-hero" from className if it's there because HoverTiltCard already adds it
            # Actually, it's fine if it has it twice, `cn` handles it.
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file}")

print("Done")
