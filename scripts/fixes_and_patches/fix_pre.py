import re

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''<Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-\[10px\] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors gap-1\.5"
                  onClick=\{\(\) => onCopy\(currentBatch\)\}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
            </div>
            ">'''

replacement = '''<Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors gap-1.5"
                  onClick={() => onCopy(currentBatch)}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
            </div>
            <div className="relative flex-1 min-h-0 pt-10 px-5 pb-5">
              <pre className="h-full overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-500/20 selection:text-indigo-900 dark:text-sky-200/90 dark:selection:text-indigo-100 custom-scrollbar">
                {currentBatch}
              </pre>
            </div>'''

if '">\n                <pre' in content:
    print("Found orphaned tag!")
    content = re.sub(r'</div>\n\s*</div>\n\s*">\n\s*<pre.*?</pre>\n\s*</div>', replacement + '\n          </div>', content, flags=re.DOTALL)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Not found orphaned tag.")
