import io

with open('frontend/lib/soql-generator-utils.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('export interface CaseAssignmentRow {\n  id: string;\n  status: "Open";\n}', 'export interface CaseAssignmentRow {\n  id: string;\n  status: "Open";\n  category?: string;\n}')

with open('frontend/lib/soql-generator-utils.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed interface in utils!')
