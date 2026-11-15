with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Let's fix the CardHeader of Step 4
pattern = r'<CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row items-center justify-between">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">CHILD TO ASSET</CardTitle>\s*\{customChildDetailsProcessor\.output && \(\s*<Button\s*variant="outline"\s*size="sm"\s*className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"\s*onClick=\{\(\) => handleCopy\(customChildDetailsProcessor\.output\)\}\s*>\s*<Copy className="h-3.5 w-3.5" /> Copy TSV\s*</Button>\s*\)\}\s*</CardHeader>'

new_str = """<CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">CHILD TO ASSET</CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
                    {customChildDetailsProcessor.output && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                        onClick={() => handleCopy(customChildDetailsProcessor.output)}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy TSV
                      </Button>
                    )}
                  </div>
                </CardHeader>"""

content, count = re.subn(pattern, new_str, content)
print(f"Replaced {count} times.")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

