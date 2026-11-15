import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Component SOQL Query</CardTitle>" in line:
        # found CardTitle
        # replace CardHeader
        lines[i-2] = '                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">\n'
        lines[i-1] = '                    <div className="flex flex-col w-full relative mt-5 md:mt-6">\n'
        lines[i] = '                        <div className="absolute top-0 right-0 -mt-1">\n                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}>\n                            <Copy className="h-3.5 w-3.5" /> Copy\n                          </Button>\n                        </div>\n                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">Component SOQL Query</CardTitle>\n'
        # look ahead for CardContent inner div
        for j in range(i, i+10):
            if "bg-slate-100/35" in lines[j]:
                lines[j] = '                    <div className="flex flex-col overflow-hidden bg-transparent">\n'
                break
        # look ahead for pre
        for j in range(i, i+10):
            if "<pre" in lines[j]:
                lines[j] = lines[j].replace('p-5', 'p-0')
                break

    if "Account SOQL Query</CardTitle>" in line:
        # replace CardHeader
        lines[i-2] = '                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">\n'
        lines[i-1] = '                    <div className="flex flex-col w-full relative mt-5 md:mt-6">\n'
        lines[i] = '                        <div className="absolute top-0 right-0 -mt-1">\n                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>\n                            <Copy className="h-3.5 w-3.5" /> Copy\n                          </Button>\n                        </div>\n                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">Account SOQL Query</CardTitle>\n'
        # look ahead for CardContent inner div
        for j in range(i, i+10):
            if "bg-slate-100/35" in lines[j]:
                lines[j] = '                    <div className="flex flex-col overflow-hidden bg-transparent">\n'
                break
        # look ahead for pre
        for j in range(i, i+10):
            if "<pre" in lines[j]:
                lines[j] = lines[j].replace('p-5', 'p-0')
                break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Success")
