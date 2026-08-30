import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update TemplatePicker trigger
old_picker = r'className=\{cn\(\s*"group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200",\s*isOpen\s*\?\s*"border-blue-400/60 bg-white/90 text-slate-950 ring-2 ring-blue-400/20 dark:bg-slate-900 dark:text-white"\s*:\s*"border-slate-200/80 bg-white/75 text-slate-900 hover:border-sky-400/45 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900"\s*\)\}'

new_picker = """className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-300 backdrop-blur-md",
          isOpen
            ? "border-white/30 bg-white/20 text-slate-900 ring-2 ring-white/20 dark:bg-black/40 dark:border-white/20 dark:text-white"
            : "border-slate-300/40 bg-white/10 text-slate-900 hover:border-white/60 hover:bg-white/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.08]"
        )}"""
content = re.sub(old_picker, new_picker, content, flags=re.DOTALL)

# 2. Update the Favorite Star button
old_star = r'className="flex-shrink-0 flex items-center justify-center w-\[60px\] rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shadow-sm"'

new_star = 'className="flex-shrink-0 flex items-center justify-center w-[60px] rounded-xl bg-white/10 dark:bg-white/[0.03] border border-slate-300/40 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/[0.08] backdrop-blur-md transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]"'
content = content.replace(old_star, new_star)

# 3. Update the 4 Neumorphism buttons to Glassmorphism
old_buttons = r'\{isCancellation && \(\s*<div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-2">.*?</div>\s*\)\}'

new_buttons = """{isCancellation && (
                  <div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-2">
                    {["CCO", "NAMO", "NON NAMO", "CASE"].map((type) => {
                      const isSelected = cancellationType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setCancellationType(type as any)}
                          className={cn(
                            "px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex-1 min-w-fit text-center backdrop-blur-md border",
                            isSelected
                              ? "bg-white/30 dark:bg-white/[0.15] border-white/60 dark:border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.15)] text-blue-700 dark:text-sky-300 scale-105"
                              : "bg-white/10 dark:bg-white/[0.03] border-slate-300/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/[0.08] hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                )}"""
content = re.sub(old_buttons, new_buttons, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 12")
