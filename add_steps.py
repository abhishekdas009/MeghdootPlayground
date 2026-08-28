with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update PasteResultCard definition
old_paste_def = """function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy,
  className
}: {
  className?: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  transformedValue: string;
  onCopy: (val: string) => void;
}) {"""

new_paste_def = """function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy,
  className,
  step
}: {
  className?: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  transformedValue: string;
  onCopy: (val: string) => void;
  step?: string;
}) {"""
content = content.replace(old_paste_def, new_paste_def)

# 2. Add watermark to PasteResultCard
old_paste_render = """<Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>
      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">"""

new_paste_render = """<Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>
      {step && (
        <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[35px] md:text-[45px] lg:text-[55px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            {step}
          </span>
        </div>
      )}
      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">"""
content = content.replace(old_paste_render, new_paste_render)

# 3. Add steps to isTS cards
old_ts_cards = """          {isTS && (
            <>
              <QueryPreviewCard
                title="TS (Ticket Status)"
                subtitle="WorkOrder query preview"
                batches={workOrderPreview}
                batchIndex={tsBatchIndex}
                setBatchIndex={setTsBatchIndex}
                className="h-[350px] 2xl:h-auto 2xl:min-h-0 flex-1 min-h-[320px]"
                  onCopy={handleCopy}
              />
              <PasteResultCard
                title="Paste Ticket result"
                subtitle="Transform Status to Accepted"
                value={tsResultPaste}
                onChange={setTsResultPaste}
                transformedValue={transformStatus(tsResultPaste, "Accepted", "WorkOrder")}
                className="h-[350px] 2xl:h-auto 2xl:min-h-0 flex-1 min-h-[320px]"
                  onCopy={handleCopy}
              />
              <QueryPreviewCard
                title="SA (Service Appointment)"
                subtitle="ServiceAppointment query preview"
                batches={serviceAppointmentPreview}
                batchIndex={saBatchIndex}
                setBatchIndex={setSaBatchIndex}
                className="h-[350px] 2xl:h-auto 2xl:min-h-0 flex-1 min-h-[320px]"
                  onCopy={handleCopy}
              />
              <PasteResultCard
                title="Paste Service Appointment result"
                subtitle="Transform Status to None"
                value={saResultPaste}
                onChange={setSaResultPaste}
                transformedValue={transformStatus(saResultPaste, "None", "ServiceAppointment")}
                className="h-[350px] 2xl:h-auto 2xl:min-h-0 flex-1 min-h-[320px]"
                  onCopy={handleCopy}
              />
            </>
          )}"""

# I need to use regex because the className strings might be slightly different. Let's just use simple replacements for each component invocation.
import re
content = re.sub(
    r'<QueryPreviewCard\s+title="TS \(Ticket Status\)"',
    '<QueryPreviewCard\n                step="STEP 2"\n                title="TS (Ticket Status)"',
    content
)
content = re.sub(
    r'<PasteResultCard\s+title="Paste Ticket result"',
    '<PasteResultCard\n                step="STEP 3"\n                title="Paste Ticket result"',
    content
)
content = re.sub(
    r'<QueryPreviewCard\s+title="SA \(Service Appointment\)"',
    '<QueryPreviewCard\n                step="STEP 4"\n                title="SA (Service Appointment)"',
    content
)
content = re.sub(
    r'<PasteResultCard\s+title="Paste Service Appointment result"',
    '<PasteResultCard\n                step="STEP 5"\n                title="Paste Service Appointment result"',
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
