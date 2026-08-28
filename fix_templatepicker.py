import os

filepath = 'frontend/app/soql-generator/page.tsx'
orig_filepath = 'frontend/page_original.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

with open(orig_filepath, 'r', encoding='utf-8') as f:
    orig = f.read()

idx_orig = orig.find('function TemplatePicker(')
idx_orig_end = orig.find('export default function SOQLGeneratorPage()')

if idx_orig != -1 and idx_orig_end != -1:
    missing_part = orig[idx_orig:idx_orig_end]
    # We need to insert it right before export default function SOQLGeneratorPage()
    idx = content.find('export default function SOQLGeneratorPage()')
    if idx != -1:
        content = content[:idx] + missing_part + '\n' + content[idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Restored TemplatePicker")
    else:
        print("Could not find SOQLGeneratorPage in content")
else:
    print("Could not find TemplatePicker in orig")
