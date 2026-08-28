import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove flex-1 from Final Output Card
target_card = 'Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col flex-1 min-h-0 transition-all duration-300 relative group"'
rep_card = 'Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group shrink-0"'
content = content.replace(target_card, rep_card)

# 2. Remove flex-1 from CardContent
target_content = '<CardContent className="p-5 pt-0 relative z-10 flex-1 flex flex-col min-h-0">'
rep_content = '<CardContent className="p-5 pt-0 relative z-10 flex flex-col">'
content = content.replace(target_content, rep_content)

# 3. Remove flex-1 from textarea wrapper
target_wrapper = '<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20 dark:border dark:border-white/[0.05]">'
rep_wrapper = '<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col overflow-hidden dark:bg-black/20 dark:border dark:border-white/[0.05]">'
content = content.replace(target_wrapper, rep_wrapper)

# 4. Give Textarea a fixed height instead of flex-1 min-h-[100px]
target_textarea = 'className={lex-1 min-h-[100px] w-full resize-none border-0 bg-transparent p-5 font-mono text-xs focus-visible:ring-0 }'
rep_textarea = 'className={h-[120px] w-full resize-none border-0 bg-transparent p-5 font-mono text-xs focus-visible:ring-0 }'
content = content.replace(target_textarea, rep_textarea)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success: Fixed Final Output height")

