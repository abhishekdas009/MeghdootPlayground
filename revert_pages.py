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

    # Remove the import
    content = re.sub(r'import \{ HoverTiltCard \} from "@/components/ui/hover-tilt-card";\n?', '', content)

    # Find <HoverTiltCard ... >
    while '<HoverTiltCard' in content:
        start_idx = content.find('<HoverTiltCard')
        end_idx = content.find('>', start_idx)
        
        opening = content[start_idx:end_idx+1]
        
        # Determine if it should be motion.div or div
        if 'initial={{' in opening or 'animate={{' in opening:
            new_opening = opening.replace('<HoverTiltCard', '<motion.div')
        else:
            new_opening = opening.replace('<HoverTiltCard', '<div')
            
        # Add page-hero to className
        new_opening = new_opening.replace('className="', 'className="page-hero ')
        
        content = content[:start_idx] + new_opening + content[end_idx+1:]
        
    # Replace closing tags
    # If the opening tag was motion.div, we need to replace </HoverTiltCard> with </motion.div>.
    # If it was div, we need to replace with </div>.
    # To be perfectly safe, since we know exactly which one corresponds to which (or since there's only one per file),
    # we can just replace </HoverTiltCard> based on whether <motion.div className="page-hero is in the file.
    if '<motion.div' in content and 'className="page-hero' in content and 'initial=' in content:
        # Actually, formula-generator uses <div className="page-hero", but the inner one is motion.div.
        # Let's just check if we used motion.div for the hero.
        if re.search(r'<motion\.div[^>]*className="page-hero', content):
            content = content.replace('</HoverTiltCard>', '</motion.div>')
        else:
            content = content.replace('</HoverTiltCard>', '</div>')
    else:
        content = content.replace('</HoverTiltCard>', '</div>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Reverted {file}")

print("Done")
