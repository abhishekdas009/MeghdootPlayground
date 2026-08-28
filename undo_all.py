import os

filepath = 'frontend/app/soql-generator/page.tsx'
orig_filepath = 'frontend/page_original.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

with open(orig_filepath, 'r', encoding='utf-8') as f:
    orig = f.read()

idx_orig_start = orig.find('function TemplatePicker(')
idx_orig_end = orig.find('export default function SOQLGeneratorPage()')
# Wait, we want EVERYTHING from TemplatePicker down to the end of the file!
if idx_orig_start != -1:
    missing_part = orig[idx_orig_start:]
    
    idx = content.find('function TemplatePicker(')
    if idx != -1:
        # replace everything from TemplatePicker downwards
        new_content = content[:idx] + missing_part
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Restored TemplatePicker and SOQLGeneratorPage from orig")
    else:
        print("Could not find TemplatePicker in content")
else:
    print("Could not find TemplatePicker in orig")
