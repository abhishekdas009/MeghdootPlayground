import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def clean_badge_class(match):
    full_tag = match.group(0)
    # Only clean if it's a Badge tag
    if not full_tag.startswith('<Badge'):
        return full_tag
        
    # Find className="<stuff>"
    class_match = re.search(r'className="([^"]+)"', full_tag)
    if class_match:
        classes = class_match.group(1).split()
        
        # Keep only layout/typography classes that are not colors
        kept_classes = []
        for c in classes:
            if c.startswith(('bg-', 'border-', 'text-', 'shadow-', 'px-', 'py-', 'rounded-', 'dark:bg-', 'dark:border-', 'dark:text-')):
                continue
            if c in ['border', 'shadow-inner', 'shadow-sm']:
                continue
            kept_classes.append(c)
            
        kept_classes.append('text-[10px]')
        kept_classes.append('font-black')
        kept_classes.append('uppercase')
        kept_classes.append('tracking-widest')
        kept_classes.append('text-slate-500')
        kept_classes.append('dark:text-slate-400')
        
        # Remove duplicates while preserving order
        unique_classes = list(dict.fromkeys(kept_classes))
        
        new_class_attr = 'className="' + ' '.join(unique_classes) + '"'
        new_tag = full_tag[:class_match.start()] + new_class_attr + full_tag[class_match.end():]
        return new_tag
        
    return full_tag

# Regex to match <Badge ... > (note: doesn't handle nested {} well if they contain strings with >)
# But in our code, Badge tags don't usually have complex > inside the tag itself unless it's an arrow function.
# Let's just find all <Badge className="..."> tags.
content = re.sub(r'<Badge[^>]+className="[^"]+"[^>]*>', clean_badge_class, content)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
