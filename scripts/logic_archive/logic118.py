with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

pattern = r'<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1">Paste Salesforce Result</CardTitle>\s*</CardHeader>'

new_str = """<CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Paste Salesforce Result</CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm"
                      onClick={() => setChildDetailsInput("")}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear
                    </Button>
                  </div>
                </CardHeader>"""

content, count = re.subn(pattern, new_str, content)
print(f"Replaced {count} times.")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
