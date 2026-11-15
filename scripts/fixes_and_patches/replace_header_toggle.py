import sys

with open('frontend/components/layout/header.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<button' in line and 'role="switch"' in lines[i+2]:
        start_idx = i
        for j in range(start_idx, start_idx+100):
            if '</button>' in lines[j]:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    new_toggle = '''              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                onClick={toggleTheme}
                className={cn(
                  "relative flex h-[34px] w-[70px] shrink-0 items-center overflow-hidden rounded-full transition-colors duration-500 ease-in-out shadow-inner",
                  theme === "dark" ? "bg-[#5a56c6]" : "bg-[#48b5f2]"
                )}
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {/* Dark Mode Decor: Stars */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    theme === "dark" ? "opacity-100" : "opacity-0"
                  )}
                >
                  <svg width="100%" height="100%" viewBox="0 0 70 34" className="absolute inset-0 pointer-events-none">
                    <g transform="translate(45, 8) scale(0.6)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.9" />
                    </g>
                    <g transform="translate(56, 17) scale(0.4)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.6" />
                    </g>
                    <g transform="translate(41, 21) scale(0.5)">
                      <path d="M 5 0 L 6.5 3.5 L 10 3.5 L 7 5.5 L 8.5 9 L 5 7 L 1.5 9 L 3 5.5 L 0 3.5 L 3.5 3.5 Z" fill="white" opacity="0.4" />
                    </g>
                  </svg>
                </div>

                {/* Light Mode Decor: Clouds */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    theme === "light" ? "opacity-100" : "opacity-0"
                  )}
                >
                  <svg width="100%" height="100%" viewBox="0 0 70 34" className="absolute inset-0 pointer-events-none">
                    <rect x="10" y="10" width="12" height="4" rx="2" fill="white" opacity="0.95" />
                    <rect x="14" y="8" width="6" height="4" rx="2" fill="white" opacity="0.95" />

                    <rect x="18" y="22" width="14" height="4" rx="2" fill="white" opacity="0.8" />
                    <rect x="22" y="20" width="8" height="4" rx="2" fill="white" opacity="0.8" />
                    
                    <rect x="6" y="20" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
                  </svg>
                </div>

                {/* Thumb */}
                <motion.span
                  aria-hidden="true"
                  animate={{ x: theme === "dark" ? 3 : 39 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute flex h-[28px] w-[28px] items-center justify-center rounded-full shadow-sm"
                >
                    {/* Moon */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full bg-[#dcdcdc] transition-all duration-500 ease-in-out overflow-hidden",
                        theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                      )}
                    >
                        {/* Craters */}
                        <div className="absolute left-[4px] top-[6px] h-[6px] w-[6px] rounded-full bg-[#bebebe]" />
                        <div className="absolute left-[6px] bottom-[5px] h-[8px] w-[8px] rounded-full bg-[#bebebe]" />
                        <div className="absolute right-[8px] top-[12px] h-[5px] w-[5px] rounded-full bg-[#bebebe]" />
                    </div>

                    {/* Sun */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full bg-[#f8c844] border-[3px] border-[#d8a127] transition-all duration-500 ease-in-out",
                        theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
                      )}
                    />
                </motion.span>
              </button>\n'''
    lines = lines[:start_idx] + [new_toggle] + lines[end_idx+1:]
    with open('frontend/components/layout/header.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Success")
else:
    print("Failed to find button block")
