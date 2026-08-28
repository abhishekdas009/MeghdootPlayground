import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

appendix = '''
              <div className="relative flex-1 min-h-0 mt-4">
                <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-500/20 selection:text-indigo-900 dark:text-sky-200/90 dark:selection:text-indigo-100 custom-scrollbar">
                  {currentBatch}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {isExample ? "No valid tickets parsed" : "No queries generated"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'''
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content.rstrip() + appendix)
    
print("Added end")
