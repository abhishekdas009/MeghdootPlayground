import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix childDetailsCurrentSOQLBatch
text = text.replace('className={h-[155px]', 'className={`h-[155px]')

# Fix transferOutput
text = text.replace('className={overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!transferOutput', 'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!transferOutput')

# Fix mailTemplateText
text = text.replace('className={overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${cancellationTotalTickets === 0', 'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${cancellationTotalTickets === 0')

# Fix caseAssignOutput
text = text.replace('className={absolute inset-0', 'className={`absolute inset-0')

# And I need to add the closing backtick before `}` for all of them!
# Wait, let's just use regex to replace all of them safely.
import re

text = re.sub(r'className=\{([^}`]+)\$\{([^}]+)\}\s*\}', r'className={`\1${\2}`}', text)
# Let's see if that matches. It should match className={string ${expr} }

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done fixing backticks!')
