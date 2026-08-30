with open("frontend/components/layout/sidebar.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

if 'import { motion } from "framer-motion"' not in content:
    content = content.replace('import { AnimatePresence, motion } from "framer-motion";', 'import { AnimatePresence, motion } from "framer-motion";\nimport { AnimatedTitle } from "@/components/ui/animated-title";')
else:
    content = content.replace('import { AnimatedTitle } from "@/components/ui/animated-title";', '')
    content = content.replace('import { AnimatePresence, motion } from "framer-motion";', 'import { AnimatePresence, motion } from "framer-motion";\nimport { AnimatedTitle } from "@/components/ui/animated-title";')

# desktop sidebar logo
pattern_desktop_logo = r'<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-\[#0176d3\]/30 overflow-hidden">\s*<Image\s*src="/logo%20white\.png"\s*alt="Meghdoot Logo"\s*width=\{32\}\s*height=\{32\}\s*className="h-full w-full object-contain dark:hidden"\s*\/>\s*<Image\s*src="/logo1\.png"\s*alt="Meghdoot Logo"\s*width=\{32\}\s*height=\{32\}\s*className="hidden h-full w-full object-contain dark:block"\s*\/>\s*<\/div>'

replacement_desktop_logo = r"""<motion.div 
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-[#0176d3]/30 overflow-hidden"
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-full h-full"
            >
              <Image
                src="/logo%20white.png"
                alt="Meghdoot Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain dark:hidden"
              />
              <Image
                src="/logo1.png"
                alt="Meghdoot Logo"
                width={32}
                height={32}
                className="hidden h-full w-full object-contain dark:block"
              />
            </motion.div>
          </motion.div>"""

content = re.sub(pattern_desktop_logo, replacement_desktop_logo, content)

# desktop sidebar text
pattern_desktop_text = r'<span className="truncate text-\[15px\] font-extrabold tracking-tight text-foreground">\s*Meghdoot Playground\s*</span>'
replacement_desktop_text = r'<AnimatedTitle text="Meghdoot Playground" className="truncate text-[15px] font-extrabold tracking-tight text-foreground" />'

content = re.sub(pattern_desktop_text, replacement_desktop_text, content)

# mobile sidebar logo
pattern_mobile_logo = r'<Image\s*src="/logo%20white\.png"\s*alt="Meghdoot Logo"\s*width=\{42\}\s*height=\{42\}\s*className="shrink-0 rounded-xl shadow-sm dark:hidden"\s*\/>\s*<Image\s*src="/logo1\.png"\s*alt="Meghdoot Logo"\s*width=\{42\}\s*height=\{42\}\s*className="hidden shrink-0 rounded-xl shadow-sm dark:block"\s*\/>'

replacement_mobile_logo = r"""<motion.div
                    initial={{ rotate: -180, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Image
                        src="/logo%20white.png"
                        alt="Meghdoot Logo"
                        width={42}
                        height={42}
                        className="shrink-0 rounded-xl shadow-sm dark:hidden"
                      />
                      <Image
                        src="/logo1.png"
                        alt="Meghdoot Logo"
                        width={42}
                        height={42}
                        className="hidden shrink-0 rounded-xl shadow-sm dark:block"
                      />
                    </motion.div>
                  </motion.div>"""

content = re.sub(pattern_mobile_logo, replacement_mobile_logo, content)

with open("frontend/components/layout/sidebar.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated sidebar.tsx logos and text")
