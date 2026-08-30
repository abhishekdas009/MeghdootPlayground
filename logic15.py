import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix in list item
old_item = r'<span className="block truncate text-sm font-bold leading-tight">\{template\.name\}</span>'
new_item = r'<span className="block text-[11px] md:text-xs font-bold leading-tight whitespace-normal pr-1">{template.name}</span>'
content = re.sub(old_item, new_item, content)

# Fix in trigger button
old_trigger = r'<span className="block truncate text-sm font-bold leading-tight">\{selectedTemplate\?\.name \?\? "Select a template"\}</span>'
new_trigger = r'<span className="block text-xs font-bold leading-tight whitespace-normal">{selectedTemplate?.name ?? "Select a template"}</span>'
content = re.sub(old_trigger, new_trigger, content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 15")
