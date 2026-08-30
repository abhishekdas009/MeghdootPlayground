with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

pattern = r'(<div className="relative flex-1 flex flex-col group min-h-\[320px\] rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/20">.*?<rect\s*width="100%"\s*height="100%"\s*fill="none"\s*rx="16"\s*ry="16"\s*stroke="currentColor"\s*strokeWidth="2"\s*strokeDasharray="10 10"\s*\/>\s*<\/svg>)'

replacement = r"""<div className="relative flex-1 flex flex-col group min-h-[320px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="shimmerGradientText" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
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
                      </svg>"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated shimmer gradient")
