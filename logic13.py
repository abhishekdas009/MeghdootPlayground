import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_button = r'className="flex-shrink-0 flex items-center justify-center w-\[60px\] rounded-xl bg-white/10 dark:bg-white/\[0\.03\] border border-slate-300/40 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/\[0\.08\] backdrop-blur-md transition-all shadow-\[0_4px_30px_rgba\(0,0,0,0\.1\)\]"'
new_button = 'className="flex-shrink-0 flex items-center justify-center p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all"'
content = re.sub(old_button, new_button, content)

old_star = r'<Star\s*className=\{\`h-5 w-5'
new_star = r'<Star\n                      className={`h-[18px] w-[18px]'
content = re.sub(old_star, new_star, content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 13")
