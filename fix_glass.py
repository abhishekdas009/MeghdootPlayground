import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_str = 'className="max-h-[350px] z-[100] rounded-2xl border-slate-200/90 bg-white/[0.98] p-1.5 backdrop-blur-2xl dark:border-slate-600/80 dark:bg-[#071426]/[0.98]"'
new_str = 'className="max-h-[350px] z-[100] rounded-2xl border border-white/40 bg-white/45 p-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"'

text = text.replace(old_str, new_str)

# Also let's check if there are other SelectContents in the file that might need it
# Or any other PopoverContent?
import re
for m in re.finditer(r'<SelectContent[^>]*>', text):
    print(m.group(0))

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
