with open("frontend/components/layout/shell.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_bg = """    <div className="app-shell relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#302423]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
      </div>"""

new_bg = """    <div className="app-shell relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#070707]">
      {/* Grid overlay for dark mode inspired by GCore */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Light mode blobs */}
        <div className="absolute -top-[20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-400/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] dark:hidden sm:h-[60%] sm:w-[60%]" />
        
        {/* Dark mode ambient orange/amber glow */}
        <div className="absolute -top-[30%] right-[-10%] h-[80%] w-[60%] rounded-full hidden dark:block bg-orange-600/10 mix-blend-screen blur-[140px] opacity-80" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full hidden dark:block bg-amber-600/10 mix-blend-screen blur-[140px] opacity-60" />
      </div>"""

content = content.replace(old_bg, new_bg)

with open("frontend/components/layout/shell.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
