import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern5 = r'<div className="mt-2 flex flex-wrap gap-1\.5">\s*<Badge[^>]*>\s*\{caseAssignmentResult\.assignedCount\} assigned\s*</Badge>\s*<Badge[^>]*>\s*\{caseAssignmentResult\.unassignedCaseIds\.length\} unassigned\s*</Badge>\s*</div>'
replacement5 = '''<div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            <span>{caseAssignmentResult.assignedCount} assigned</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className={caseAssignmentResult.unassignedCaseIds.length ? "text-amber-500" : ""}>
                              {caseAssignmentResult.unassignedCaseIds.length} unassigned
                            </span>
                          </div>'''

content = re.sub(pattern5, replacement5, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
