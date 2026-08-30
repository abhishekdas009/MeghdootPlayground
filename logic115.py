with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_str = """                  {customChildDetailsProcessor.output && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                      onClick={() => handleCopy(customChildDetailsProcessor.output)}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy TSV
                    </Button>
                  )}"""

new_str = """                  <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
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
                  </div>"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success 115")
else:
    print("Failed to replace Step 4 button container.")
