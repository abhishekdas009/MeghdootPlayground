import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern6 = r'<div className="flex flex-wrap gap-1 mt-1">\s*\{caseAssignmentResult\.extraOwners\.map\(o => \(\s*<Badge key=\{o\.id\}[^>]*>\{o\.name\}</Badge>\s*\)\)\}\s*</div>'
replacement6 = '''<div className="flex flex-wrap gap-1 mt-1 text-[10px] font-black text-slate-500 dark:text-slate-400">
                              {caseAssignmentResult.extraOwners.map(o => o.name).join(', ')}
                            </div>'''

content = re.sub(pattern6, replacement6, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
