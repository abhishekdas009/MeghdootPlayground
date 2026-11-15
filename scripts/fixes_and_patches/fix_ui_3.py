import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_header = '''                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Select what to perform</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">'''

new_header = '''                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Query Template</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">'''

if old_header in content:
    content = content.replace(old_header, new_header)
    print("Updated Query Template layout")
else:
    print("Not found")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
