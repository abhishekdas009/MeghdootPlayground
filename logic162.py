with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

pattern = r'(<Textarea\s*placeholder=\{activeTemplate\?\.category === "Asset" \? `Paste component IDs here\.\.\.\\nCMP-00123\\nCMP-00124\\nCMP-00125` : `Paste ticket numbers here\.\.\.\\nA26060134750678\\nA26060134750476\\nA26060134750619`\}\s*className="flex-1 font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y min-h-\[320px\]"\s*value=\{ticketsInput\}\s*onChange=\{\(event\) => \{.*?\s*\}\}\s*\/>)'

replacement = r"""<div className="relative flex-1 flex flex-col group min-h-[320px] rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/20">
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        "text-slate-300 dark:text-slate-700 group-hover:text-blue-500/50 group-hover:animate-[dash_2s_linear_infinite] group-focus-within:text-blue-500/80 group-focus-within:animate-[dash_1s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <rect
                          width="100%"
                          height="100%"
                          fill="none"
                          rx="16"
                          ry="16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="10 10"
                        />
                      </svg>
                      <Textarea
                        placeholder={activeTemplate?.category === "Asset" ? `Paste component IDs here...\nCMP-00123\nCMP-00124\nCMP-00125` : `Paste ticket numbers here...\nA26060134750678\nA26060134750476\nA26060134750619`}
                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-10"
                        value={ticketsInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setTicketsInput(value);
                          setGeneratedAtLeastOnce(false);
                          if (selectedTemplate !== "1" && value.trim()) {

                          }
                        }}
                      />
                    </div>"""

# Because the onChange logic might span multiple lines, using DOTALL is important.
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated Textarea with shimmer border")
