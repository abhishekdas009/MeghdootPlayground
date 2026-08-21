import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Final Assignment Output pre block (line ~4362)
# We find the specific pre block by context
context_match = r'(<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">)\s*<pre className="([^"]+emerald[^"]+)">\s*(\{caseAssignOutput[^}]+\})\s*</pre>\s*(</div>)'

def replace_pre(m):
    return f'''{m.group(1)}
                      <div className="flex-1 relative w-full h-full min-h-[200px]">
                        <pre className="absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                          {m.group(3)}
                        </pre>
                      </div>
                    {m.group(4)}'''

text = re.sub(context_match, replace_pre, text)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Pre block fixed!')
