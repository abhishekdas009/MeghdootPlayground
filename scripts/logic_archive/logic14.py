import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_star = r'<button\s*type="button"\s*onClick=\{\(\) => toggleFav\(selectedTemplate\)\}\s*className="flex-shrink-0 flex items-center justify-center w-\[60px\] rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shadow-sm"'
new_star = r'<button type="button" onClick={() => toggleFav(selectedTemplate)} className="flex-shrink-0 flex items-center justify-center p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all"'
content = re.sub(old_star, new_star, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 14")
