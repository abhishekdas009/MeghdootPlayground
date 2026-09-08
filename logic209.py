with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Update Textarea 1 (Input)
input_textarea = r'''<Textarea
                placeholder={`Paste ticket numbers here...\n\nA260182314123\nA260182314124\nA260182314125`}
                className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-0 focus-visible:outline-none p-6 shadow-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />'''

new_input_textarea = r'''<div className="relative flex-1 flex flex-col group min-h-[350px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                <svg className={cn(
                  "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300 z-0",
                  "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                )} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shimmerGradientInput" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="none" rx="16" ry="16" stroke="url(#shimmerGradientInput)" strokeWidth="2" strokeDasharray="20, 20" strokeLinecap="round" className="opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                </svg>
                <Textarea
                  placeholder={`Paste ticket numbers here...\n\nA260182314123\nA260182314124\nA260182314125`}
                  className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-0 focus-visible:outline-none p-6 shadow-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 relative z-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>'''

content = content.replace(input_textarea, new_input_textarea)

# Update Textarea 2 (Output)
output_textarea_container = r'''<div className="flex-1 relative group h-full">
                  <Textarea
                    readOnly
                    value={currentOutput}
                    className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-6 shadow-none transition-all resize-none custom-scrollbar focus-visible:ring-0 focus-visible:outline-none"
                  />
                  {/* Glowing Overlay effect on hover for the terminal block */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-blue-500/20 transition-all duration-300" />
                </div>'''

new_output_textarea_container = r'''<div className="relative flex-1 flex flex-col group min-h-[250px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10 h-full">
                  <svg className={cn(
                    "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300 z-0",
                    "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                  )} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shimmerGradientOutput" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="none" rx="16" ry="16" stroke="url(#shimmerGradientOutput)" strokeWidth="2" strokeDasharray="20, 20" strokeLinecap="round" className="opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                  </svg>
                  <Textarea
                    readOnly
                    value={currentOutput}
                    className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-6 shadow-none transition-all resize-none custom-scrollbar focus-visible:ring-0 focus-visible:outline-none relative z-10"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-emerald-500/20 transition-all duration-300 z-20" />
                </div>'''

content = content.replace(output_textarea_container, new_output_textarea_container)

# Update Format Buttons
old_button_class = r'''className={cn(
                        "flex items-center justify-center min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-sm",
                        selectedFormat === f.id
                          ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30"
                          : "border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground hover:border-slate-300 dark:hover:border-slate-600"
                      )}'''

new_button_class = r'''className={cn(
                        "flex items-center justify-center min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 relative overflow-hidden group",
                        selectedFormat === f.id
                          ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "border-white/10 bg-white/5 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-white/20 hover:border-white/20 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm"
                      )}'''

content = content.replace(old_button_class, new_button_class)

with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated!")
