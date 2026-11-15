import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Or Paste Manually</CardTitle>" in line:
        start_idx = i - 6
        print("Lines to modify:")
        for j in range(start_idx, i+1):
            print(repr(lines[j]))
            
        # We need to insert the watermark after '<Card className=...>' which is at start_idx
        # And we need to add mt-6 md:mt-8 to '<div className="flex items-center gap-3 w-full">' which is at start_idx + 2
        
        watermark = '''                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      ADD MANUALLY
                    </span>
                  </div>\n'''
                  
        lines.insert(start_idx + 1, watermark)
        
        # start_idx + 2 is now start_idx + 3 because we inserted 1 element
        if 'className="flex items-center gap-3 w-full"' in lines[start_idx + 3]:
            lines[start_idx + 3] = lines[start_idx + 3].replace('w-full"', 'w-full mt-6 md:mt-8"')
            print("Successfully added watermark and updated header margin.")
        
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

