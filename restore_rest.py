import os

filepath = 'frontend/app/soql-generator/page.tsx'
orig_filepath = 'frontend/page_original.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

with open(orig_filepath, 'r', encoding='utf-8') as f:
    orig_content = f.read()

idx = orig_content.find('export default function SOQLGenerator() {')
if idx != -1:
    missing_part = orig_content[idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content + '\n' + missing_part)
    print("Restored missing part")
else:
    print("Could not find SOQLGenerator in orig")
