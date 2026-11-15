import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

last_import_index = 0
for i, line in enumerate(lines):
    if line.startswith('import '):
        last_import_index = i

lines.insert(last_import_index + 1, 'import { JsonViewer } from "@/components/ui/json-viewer";\n')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Added JsonViewer import!')
