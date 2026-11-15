import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will replace my arbitrary strings with the user's format.

shadow_out_light = "shadow-[-5px_-5px_10px_rgba(255,_255,_255,_0.8),_5px_5px_10px_rgba(0,_0,_0,_0.15)]"
shadow_in_light = "shadow-[-1px_-1px_5px_rgba(255,_255,_255,_0.6),_1px_1px_5px_rgba(0,_0,_0,_0.2),_inset_-2px_-2px_5px_rgba(255,_255,_255,_1),_inset_2px_2px_4px_rgba(0,_0,_0,_0.2)]"

shadow_out_dark = "dark:shadow-[-5px_-5px_10px_rgba(255,_255,_255,_0.03),_5px_5px_10px_rgba(0,_0,_0,_0.6)]"
shadow_in_dark = "dark:shadow-[-1px_-1px_5px_rgba(255,_255,_255,_0.03),_1px_1px_5px_rgba(0,_0,_0,_0.5),_inset_-2px_-2px_5px_rgba(255,_255,_255,_0.05),_inset_2px_2px_4px_rgba(0,_0,_0,_0.6)]"


old_block = r'\{isCancellation && \(\s*<div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-1">.*?</div>\s*\)\}'

new_block = f"""{{isCancellation && (
                  <div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-2">
                    {{["CCO", "NAMO", "NON NAMO", "CASE"].map((type) => {{
                      const isSelected = cancellationType === type;
                      return (
                        <button
                          key={{type}}
                          onClick={{() => setCancellationType(type as any)}}
                          className={{cn(
                            "px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex-1 min-w-fit text-center",
                            "bg-slate-50 dark:bg-slate-900",
                            isSelected
                              ? "text-violet-500 {shadow_in_light} {shadow_in_dark}"
                              : "text-slate-500 hover:text-violet-400 {shadow_out_light} {shadow_out_dark} hover:{shadow_in_light} dark:hover:{shadow_in_dark[5:]}"
                          )}}
                        >
                          {{type}}
                        </button>
                      );
                    }})}}
                  </div>
                )}}"""

content = re.sub(old_block, new_block, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 10")
