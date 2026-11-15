with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix PasteResultCard Header
old_paste_header = """      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${step ? "mt-5 md:mt-6" : ""}`}>
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>"""

new_paste_header = """      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-row flex-wrap gap-4 items-start justify-between ${step ? "mt-8 md:mt-10" : ""}`}>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>"""

content = content.replace(old_paste_header, new_paste_header)

# Fix QueryPreviewCard Header
old_query_header = """      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${step ? "mt-5 md:mt-6" : ""}`}>
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>"""

new_query_header = """      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-row flex-wrap gap-4 items-start justify-between ${step ? "mt-8 md:mt-10" : ""}`}>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>"""

content = content.replace(old_query_header, new_query_header)

# Fix PasteResultCard textarea min-h-0
content = content.replace(
    'className="flex-1 w-full rounded-2xl border',
    'className="flex-1 min-h-0 w-full rounded-2xl border'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success 50")
