import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the fixed height from the Grid
text = text.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full h-[580px]">',
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full">'
)

# 2. Fix Final Assignment Output pre block
old_pre = '<pre className="flex-1 overflow-auto whitespace-pre-wrap p-5 font-mono text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 min-h-0 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">'
new_pre = '''<div className="flex-1 relative min-h-[200px] w-full">
                      <pre className="absolute inset-0 overflow-auto whitespace-pre-wrap p-5 font-mono text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">'''

text = text.replace(old_pre, new_pre)

# We need to close the div for the pre block. The pre block is followed by </pre> and then </CardContent>
text = text.replace(
    '</pre>\n                  </CardContent>',
    '</pre>\n                    </div>\n                  </CardContent>'
)

# 3. Fix Owner Master Roster list
old_roster = '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-[200px]">'
new_roster = '''<div className="flex-1 relative min-h-[200px] w-full">
                      <div className="absolute inset-0 overflow-y-auto no-scrollbar space-y-2 pr-1 pb-4">'''

text = text.replace(old_roster, new_roster)

# We need to close the div for the roster block.
text = text.replace(
    '</div>\n                  </CardContent>\n                </Card>',
    '</div>\n                    </div>\n                  </CardContent>\n                </Card>'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Holy grail architecture applied!')
