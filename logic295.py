with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { ThemeCustomizer } from "@/components/layout/theme-customizer";\n'
if "ThemeCustomizer" not in content:
    # insert after GlobalSearchModal
    content = content.replace(
        'import { GlobalSearchModal } from "@/components/layout/global-search-modal";',
        'import { GlobalSearchModal } from "@/components/layout/global-search-modal";\nimport { ThemeCustomizer } from "@/components/layout/theme-customizer";'
    )

old_div = """          {/* Theme rail + activity updates */}
          <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}"""

new_div = """          {/* Theme rail + activity updates */}
          <div className="hidden md:flex items-center gap-2">
              <ThemeCustomizer />
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}"""

if old_div in content:
    content = content.replace(old_div, new_div)
    with open("frontend/components/layout/header.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Added ThemeCustomizer to header.")
else:
    print("Could not find the target div in header.")
