with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# PasteResultCard
old_paste_sig = """function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy
}: {"""
new_paste_sig = """function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy,
  className
}: {
  className?: string;"""

content = content.replace(old_paste_sig, new_paste_sig)

old_paste_card = """<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]">"""
new_paste_card = """<Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>"""

content = content.replace(old_paste_card, new_paste_card)

# QueryPreviewCard
old_query_sig = """function QueryPreviewCard({
  title,
  subtitle,
  batches,
  batchIndex,
  setBatchIndex,
  onCopy,
    isExample,
    step,
  }: {"""
new_query_sig = """function QueryPreviewCard({
  title,
  subtitle,
  batches,
  batchIndex,
  setBatchIndex,
  onCopy,
  isExample,
  step,
  className
}: {
  className?: string;"""

content = content.replace(old_query_sig, new_query_sig)

old_query_card = """<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]">"""
new_query_card = """<Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>"""

content = content.replace(old_query_card, new_query_card)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
