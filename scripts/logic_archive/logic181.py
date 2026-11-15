with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# header logo
pattern_header_logo = r'<Image\s*src="/logo%20white\.png"\s*alt="Meghdoot Logo"\s*width=\{42\}\s*height=\{42\}\s*className="shrink-0 rounded-xl shadow-sm dark:hidden"\s*priority\s*\/>\s*<Image\s*src="/logo1\.png"\s*alt="Meghdoot Logo"\s*width=\{42\}\s*height=\{42\}\s*className="hidden shrink-0 rounded-xl shadow-sm dark:block"\s*priority\s*\/>'

replacement_header_logo = r"""<motion.div
                initial={{ rotate: -180, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
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
                    priority
                  />
                  <Image
                    src="/logo1.png"
                    alt="Meghdoot Logo"
                    width={42}
                    height={42}
                    className="hidden shrink-0 rounded-xl shadow-sm dark:block"
                    priority
                  />
                </motion.div>
              </motion.div>"""

content = re.sub(pattern_header_logo, replacement_header_logo, content)

with open("frontend/components/layout/header.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated header.tsx logos")
