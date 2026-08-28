import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

func_definitions = """
function transformStatus(tsv: string, newStatus: string): string {
  if (!tsv.trim()) return "";
  const lines = tsv.split(/\\r?\\n/);
  if (lines.length < 2) return tsv;

  const delimiter = tsv.includes('\\t') ? '\\t' : (tsv.includes(',') ? ',' : '\\t');
  
  const headers = lines[0].split(delimiter).map(h => h.replace(/^"|"$/g, '').trim());
  const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');
  
  if (statusIdx === -1) return tsv;
  
  const result = [lines[0]];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const cols = line.split(delimiter);
    if (cols.length > statusIdx) {
      const oldVal = cols[statusIdx];
      const hasQuotes = oldVal.startsWith('"') && oldVal.endsWith('"');
      cols[statusIdx] = hasQuotes ? `"${newStatus}"` : newStatus;
    }
    result.push(cols.join(delimiter));
  }
  
  return result.join('\\n');
}

function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  transformedValue: string;
  onCopy: (val: string) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]">
      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-black tracking-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm"
              onClick={() => { onChange(""); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
            <MagneticButton
              className="h-8 px-3 gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg shadow-sm"
              onClick={() => onCopy(transformedValue)}
              glowColor="rgba(16, 185, 129, 0.15)"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Output
            </MagneticButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-4 relative z-10 overflow-hidden">
        <textarea
          className="flex-1 w-full rounded-2xl border border-slate-200/50 bg-white/50 dark:bg-white/[0.02] dark:border-white/5 p-4 text-[13px] font-mono leading-relaxed text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all shadow-inner custom-scrollbar"
          placeholder="Paste CSV from Salesforce Inspector here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value.trim() && (
          <div className="flex-1 w-full rounded-2xl border border-indigo-200/50 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-500/20 p-4 overflow-auto shadow-inner relative">
            <div className="absolute top-2 right-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70 dark:text-indigo-400/50">OUTPUT</span>
            </div>
            <pre className="font-mono text-[13px] leading-relaxed text-slate-800 dark:text-sky-200/90 custom-scrollbar whitespace-pre-wrap break-words">
              {transformedValue}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"""
if "function PasteResultCard" not in content:
    # insert before function QueryPreviewCard
    content = content.replace("function QueryPreviewCard(", func_definitions + "\n\nfunction QueryPreviewCard(")

# Now add state variables
state_vars = """  const [tsResultPaste, setTsResultPaste] = React.useState("");
  const [saResultPaste, setSaResultPaste] = React.useState("");"""

if "const [tsResultPaste, setTsResultPaste] = React.useState" not in content:
    content = content.replace('const [isOpen, setIsOpen] = React.useState(false);', 'const [isOpen, setIsOpen] = React.useState(false);\n' + state_vars)

# Now inject the new cards under isTS
ts_cards = """
                <PasteResultCard
                  title="Paste Ticket result"
                  subtitle="Transform Status to Accepted"
                  value={tsResultPaste}
                  onChange={setTsResultPaste}
                  transformedValue={transformStatus(tsResultPaste, "Accepted")}
                  onCopy={handleCopy}
                />
                <PasteResultCard
                  title="Paste Service Appointment result"
                  subtitle="Transform Status to None"
                  value={saResultPaste}
                  onChange={setSaResultPaste}
                  transformedValue={transformStatus(saResultPaste, "None")}
                  onCopy={handleCopy}
                />
"""

if "Paste Ticket result" not in content:
    # Add inside {isTS && ( <> ... </> )} block
    content = content.replace('onCopy={handleCopy}\n                />\n              </>\n            )}', 'onCopy={handleCopy}\n                />' + ts_cards + '\n              </>\n            )}')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
