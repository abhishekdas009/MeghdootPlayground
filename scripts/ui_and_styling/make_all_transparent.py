import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bg-slate-100/35 wrappers with transparent
pattern = r'<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col overflow-hidden\s*dark:bg-black/20 dark:border dark:border-white/\[0\.05\]">\s*<pre([^>]*) p-5 ([^>]*)>'
replacement = r'<div className="flex flex-col overflow-hidden bg-transparent">\n                        <pre\1 p-0 \2>'

content = re.sub(pattern, replacement, content)

# There is also one with Textarea in caseAssignOutput
pattern_textarea = r'<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col overflow-hidden\s*dark:bg-black/20 dark:border dark:border-white/\[0\.05\]">\s*<Textarea'
replacement_textarea = r'<div className="flex flex-col overflow-hidden bg-transparent">\n                      <Textarea'

content = re.sub(pattern_textarea, replacement_textarea, content)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
