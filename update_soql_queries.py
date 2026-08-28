import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# STEP 2 Replacement
pattern2 = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center gap-3">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight \s*text-foreground">Component SOQL Query</CardTitle>\s*</div>\s*</CardHeader>\s*<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">\s*<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col overflow-hidden \s*dark:bg-black/20 dark:border dark:border-white/\[0\.05\]">\s*<pre className=\{overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs \s*leading-relaxed max-h-\[320px\] min-h-\[100px\] selection:bg-blue-500/20 selection:text-blue-900 \s*dark:selection:text-blue-100 \$\{!assetTransferComponentSOQL \? "text-slate-400/60 dark:text-slate-500/50 font-medium" : \s*"text-slate-800 dark:text-sky-200"\}\\}>\s*\{assetTransferComponentSOQL \|\| "Paste component pairs to generate Component SOQL"\}\s*</pre>\s*</div>\s*</CardContent>'''

replacement2 = '''<CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                    <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">
                          Component SOQL Query
                        </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 flex-1 flex flex-col relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                      <pre className={overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 }>
                        {assetTransferComponentSOQL || "Paste component pairs to generate Component SOQL"}
                      </pre>
                    </div>
                  </CardContent>'''

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# STEP 4 Replacement
pattern4 = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center gap-3">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight \s*text-foreground">Account SOQL Query</CardTitle>\s*</div>\s*</CardHeader>\s*<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">\s*<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col overflow-hidden \s*dark:bg-black/20 dark:border dark:border-white/\[0\.05\]">\s*<pre className=\{overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs \s*leading-relaxed max-h-\[320px\] min-h-\[100px\] selection:bg-emerald-500/20 selection:text-emerald-900 \s*dark:selection:text-emerald-100 \$\{!assetTransferAccountSOQL \? "text-slate-400/60 dark:text-slate-500/50 font-medium" : \s*"text-slate-800 dark:text-sky-200"\}\\}>\s*\{assetTransferAccountSOQL \|\| "Paste component pairs to generate Account SOQL"\}\s*</pre>\s*</div>\s*</CardContent>'''

replacement4 = '''<CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                    <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">
                          Account SOQL Query
                        </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-2 flex-1 flex flex-col relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                      <pre className={overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 }>
                        {assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"}
                      </pre>
                    </div>
                  </CardContent>'''

content = re.sub(pattern4, replacement4, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
