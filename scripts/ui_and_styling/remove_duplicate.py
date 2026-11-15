import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

duplicate = '''                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      ADD MANUALLY
                    </span>
                  </div>\n'''

# Only replace the exact duplicate (keep one)
first_idx = content.find(duplicate)
if first_idx != -1:
    second_idx = content.find(duplicate, first_idx + len(duplicate))
    if second_idx != -1:
        content = content[:second_idx] + content[second_idx + len(duplicate):]
        with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Removed duplicate watermark")
    else:
        print("Only one watermark found")
else:
    print("No watermark found")
