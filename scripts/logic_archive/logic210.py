with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_button_class = r'''className={cn(
                        "flex items-center justify-center min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 relative overflow-hidden group",
                        selectedFormat === f.id
                          ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "border-white/10 bg-white/5 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-white/20 hover:border-white/20 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm"
                      )}'''

new_button_class = r'''className={cn(
                        "flex items-center justify-center min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 relative overflow-hidden group backdrop-blur-md shadow-sm",
                        selectedFormat === f.id
                          ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}'''

content = content.replace(old_button_class, new_button_class)

with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated button classes!")
