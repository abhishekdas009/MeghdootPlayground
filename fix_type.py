import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('interface CaseAssignmentRow {\n  id: string;\n  status: "Open";\n}', 'interface CaseAssignmentRow {\n  id: string;\n  status: "Open";\n  category?: string;\n}')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed interface!')
