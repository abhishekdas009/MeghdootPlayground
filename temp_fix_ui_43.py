import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add mt-2 md:mt-3 to the CardTitles
old_class = r'className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1"'
new_class = r'className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight flex-1"'
content = content.replace(old_class, new_class)

old_class2 = r'className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground"'
new_class2 = r'className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground"'
content = content.replace(old_class2, new_class2)

# Oh wait, for Step 4, it's just 'text-foreground"' without a closing bracket on the same line if it has children? 
# The regex replace should match it.
old_class3 = r'className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground'
new_class3 = r'className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground'
content = content.replace(old_class3, new_class3)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Moved CardTitles down")
