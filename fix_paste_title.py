import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full mt-6 md:mt-8">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Terminal className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Or Paste Manually</CardTitle>
                    </div>'''

replacement = '''                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full mt-8 md:mt-12">
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Or Paste Manually</CardTitle>
                    </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Removed icon and moved title down")
else:
    print("Failed")
