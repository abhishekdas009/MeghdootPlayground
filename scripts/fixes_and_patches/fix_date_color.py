import os

filepath = 'frontend/app/warranty-finder/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_class = 'className="w-full bg-transparent border-none outline-none focus:ring-0 text-base font-semibold text-foreground pb-1"'
new_class = 'className="w-full bg-transparent border-none outline-none focus:ring-0 text-base font-semibold text-foreground pb-1 dark:[color-scheme:dark]"'

if old_class in content:
    content = content.replace(old_class, new_class)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated date input class")
else:
    print("Could not find date input class")
