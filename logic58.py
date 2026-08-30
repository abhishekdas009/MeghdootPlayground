import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_button = """          })().map((shortcut) => (
            <button
              key={shortcut.id}
              onClick={() => handleTemplateChange(shortcut.id)}
              className="group p-2.5 rounded-2xl flex flex-col items-center justify-between h-full gap-2 transition-all duration-300 border backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
            >"""

new_button = """          })().map((shortcut) => {
            const isActive = selectedTemplate === shortcut.id;
            return (
            <button
              key={shortcut.id}
              onClick={() => handleTemplateChange(shortcut.id)}
              className={cn(
                "group p-2.5 rounded-2xl flex flex-col items-center justify-between h-full gap-2 transition-all duration-300 border backdrop-blur-md shadow-sm",
                isActive 
                  ? "border-indigo-400 bg-white/80 dark:bg-indigo-900/40 dark:border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.2)] -translate-y-0.5 ring-2 ring-indigo-500/20" 
                  : "hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
              )}
            >"""

# We need to change the closing tag from 
#             </span>
#           </button>
#         ))}
# to
#             </span>
#           </button>
#         )})}

old_close = """              <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight text-slate-700 dark:text-slate-300">
              {shortcut.name}
            </span>
          </button>
        ))}"""

new_close = """              <span className={cn("text-[9px] font-black uppercase tracking-widest text-center leading-tight", isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300")}>
              {shortcut.name}
            </span>
          </button>
        )})}"""

if old_button in content and old_close in content:
    content = content.replace(old_button, new_button)
    content = content.replace(old_close, new_close)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success 58")
else:
    print("Failed to find strings to replace")
