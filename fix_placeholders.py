import io
import re

with open('frontend/components/ui/textarea.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make Textarea placeholders significantly lighter
text = text.replace('placeholder:text-muted-foreground', 'placeholder:text-slate-400/50 dark:placeholder:text-slate-600/50 font-medium')

with open('frontend/components/ui/textarea.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Dim childDetailsCurrentSOQLBatch example
old_child_soql = '''                          <pre className="h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 dark:text-sky-200 dark:selection:text-blue-100">
                            {childDetailsCurrentSOQLBatch || "Paste valid Component IDs to generate the Asset SOQL query"}
                          </pre>'''
new_child_soql = '''                          <pre className={h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 }>
                            {childDetailsCurrentSOQLBatch || "Paste valid Component IDs to generate the Asset SOQL query"}
                          </pre>'''
page = page.replace(old_child_soql, new_child_soql)


# Dim assetTransferOutput example
old_transfer = '''                          <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                            {transferOutput}
                          </pre>'''
new_transfer = '''                          <pre className={overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 }>
                            {transferOutput || '"_"\t"Id"\t"Status"\t"OwnerId"\\n"[Case]"\t"500Ny00001RpOgFIAV"\t"Open"\t"005Ny00000QgwYTIAZ"'} 
                          </pre>'''
page = page.replace(old_transfer, new_transfer) # Actually wait, transferOutput doesn't have an example string there natively, let's just make it lighter if empty. But it's usually empty.


# Let's use regex to fix the mailTemplateText and postTemplateText
old_mail = '''                          <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                            {mailTemplateText}
                          </pre>'''
new_mail = '''                          <pre className={overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 }>
                            {mailTemplateText}
                          </pre>'''
page = page.replace(old_mail, new_mail)

old_post = '''                          <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                            {postTemplateText}
                          </pre>'''
new_post = '''                          <pre className={overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 }>
                            {postTemplateText}
                          </pre>'''
page = page.replace(old_post, new_post)


# And the caseAssignOutput
old_case_assign = '''                        <pre className="absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                          {caseAssignOutput || "_","Id","Status","OwnerId"\\n"[Case]","500Ny00001RpOgFIAV","Open","005Ny00000QgwYTIAZ"}
                        </pre>'''
new_case_assign = '''                        <pre className={bsolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 }>
                          {caseAssignOutput || "_","Id","Status","OwnerId"\\n"[Case]","500Ny00001RpOgFIAV","Open","005Ny00000QgwYTIAZ"}
                        </pre>'''
page = page.replace(old_case_assign, new_case_assign)


with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page)

print('Done placeholders!')
