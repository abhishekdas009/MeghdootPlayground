with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

pattern = r'(<Textarea\s*placeholder=\{`COMPONENT        NEW CID\\nBSL34933847      CID-2025004\\nBSL29709797      CID-4206214\\nBSL22295338      CID-6074821`\}\s*className="flex-1 min-h-\[220px\] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"\s*value=\{assetTransferInput\}\s*onChange=\{\(event\) => \{.*?\s*\}\}\s*\/>)'

replacement = r"""<div className="relative flex-1 flex flex-col group min-h-[220px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                    {/* Animated SVG Border */}
                    <svg className={cn(
                      "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                      "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                    )} xmlns="http://www.w3.org/2000/svg">
                      <rect
                        width="100%"
                        height="100%"
                        fill="none"
                        rx="16"
                        ry="16"
                        stroke="url(#shimmerGradientText)"
                        strokeWidth="2"
                        strokeDasharray="10 10"
                      />
                    </svg>
                    <Textarea
                      placeholder={`COMPONENT        NEW CID\nBSL34933847      CID-2025004\nBSL29709797      CID-4206214\nBSL22295338      CID-6074821`}
                      className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-10"
                      value={assetTransferInput}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAssetTransferInput(value);
                      }}
                    />
                  </div>"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated Asset Transfer Textarea with shimmer border")
