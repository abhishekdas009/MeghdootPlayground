with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# We need to find the specific Card for Query Template.
# Let's search for the exact match.
pattern = r'(<Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl \ndark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">.*?<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight \nwhitespace-nowrap">Query Template</CardTitle>.*?</Card>)'

match = re.search(pattern, content, re.DOTALL)
if match:
    card_html = match.group(1)
    
    # Replace opening <Card>
    card_html = card_html.replace(
        '<Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl \ndark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">',
        '<div className="relative overflow-hidden rounded-3xl p-[1px] group/shimmer z-30 shrink-0">\n              <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#3b82f6_50%,transparent_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#8b5cf6_50%,transparent_100%)] opacity-30 transition-opacity duration-300 group-hover/shimmer:opacity-100" />\n              <Card className="rounded-[calc(1.5rem-1px)] border-transparent bg-white/45 shadow-none backdrop-blur-xl dark:bg-slate-950/45 overflow-hidden relative group h-full w-full">'
    )
    
    # Append closing </div>
    card_html = card_html + '\n            </div>'
    
    content = content[:match.start()] + card_html + content[match.end():]
    
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Not found")
