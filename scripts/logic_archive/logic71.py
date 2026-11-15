with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_zone = """                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileUpload}
                      className={cn(
                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "border-blue-400/50 bg-blue-50/50 dark:bg-blue-900/10"
                          : isDragging
                            ? "border-[#0176d3] bg-[#0176d3]/10 scale-[1.02] shadow-sm"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >"""

new_zone = """                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileUpload}
                      className={cn(
                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto group",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : isDragging
                            ? "bg-[#0176d3]/10 scale-[1.02] shadow-sm"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "text-blue-400/80 animate-[dash_1s_linear_infinite]"
                          : isDragging
                            ? "animate-[dash_0.5s_linear_infinite]"
                            : "text-slate-300 dark:text-slate-700 group-hover:text-blue-500/80 group-hover:animate-[dash_2s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0176d3" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#0176d3" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="none"
                          rx="16"
                          ry="16"
                          stroke={isDragging ? "url(#shimmerGradient)" : "currentColor"}
                          strokeWidth="2"
                          strokeDasharray="10 10"
                        />
                      </svg>
                      <style>{`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: -20;
                          }
                        }
                      `}</style>"""

if old_zone in content:
    content = content.replace(old_zone, new_zone)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success 71")
else:
    print("Failed 71 - Exact string not found. Trying regex.")
    
    # Let's just find "onDrop={handleFileUpload}" and the className block following it
    pattern = r'onDrop=\{handleFileUpload\}\s*className=\{cn\(\s*"relative flex flex-col flex-1 items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-\[200px\] text-center transition-all duration-200 overflow-hidden w-full mx-auto",[^)]*\)\}\s*>'
    
    new_str = """onDrop={handleFileUpload}
                      className={cn(
                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto group",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : isDragging
                            ? "bg-[#0176d3]/10 scale-[1.02] shadow-sm"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "text-blue-400/80 animate-[dash_1s_linear_infinite]"
                          : isDragging
                            ? "animate-[dash_0.5s_linear_infinite]"
                            : "text-slate-300 dark:text-slate-700 group-hover:text-blue-500/80 group-hover:animate-[dash_2s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0176d3" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#0176d3" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="none"
                          rx="16"
                          ry="16"
                          stroke={isDragging ? "url(#shimmerGradient)" : "currentColor"}
                          strokeWidth="2"
                          strokeDasharray="10 10"
                        />
                      </svg>
                      <style>{`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: -20;
                          }
                        }
                      `}</style>"""
    
    content, num_subs = re.subn(pattern, new_str, content, flags=re.DOTALL)
    if num_subs > 0:
        with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Success 71 via Regex (Replaced {num_subs} times)")
    else:
        print("Failed completely")
