with open("frontend/app/analytics/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

custom_tooltip = """
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mockDate = new Date();
    const dayMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    const targetDay = dayMap[label as string] ?? 1;
    const currentDay = mockDate.getDay();
    let diff = targetDay - currentDay;
    if (diff > 0) diff -= 7; // Ensure it's in the past
    mockDate.setDate(mockDate.getDate() + diff);
    const dateString = mockDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
    const timeString = "Peak: 02:15 PM";

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 border border-border/50 p-4 rounded-xl shadow-xl backdrop-blur-md min-w-[200px]">
        <p className="font-bold text-sm text-foreground mb-1">{dateString}</p>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/50 pb-2">
          {timeString}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            let labelName = entry.name;
            if (entry.dataKey === "soql") labelName = "SOQL Generation";
            if (entry.dataKey === "excel") labelName = "Warranty Checks";
            if (entry.dataKey === "tickets") labelName = "Tickets Formatted";

            return (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-semibold text-muted-foreground">{labelName}</span>
                </div>
                <span className="text-sm font-black text-foreground">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
"""

content = content.replace("export default function AnalyticsPage() {", custom_tooltip + "\nexport default function AnalyticsPage() {")

# Now update the Tooltip inside the chart
old_tooltip = """                              <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                itemStyle={{ fontWeight: 'bold' }}
                              />"""

new_tooltip = """                              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} />"""

if old_tooltip in content:
    content = content.replace(old_tooltip, new_tooltip)
    with open("frontend/app/analytics/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated CustomTooltip successfully.")
else:
    print("Could not find Tooltip to replace.")
