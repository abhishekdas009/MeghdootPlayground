import re
with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { NoResultsIllustration } from "@/components/ui/illustrations";\n'
if "NoResultsIllustration" not in content:
    content = content.replace(
        'import { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";',
        'import { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";\nimport { NoResultsIllustration } from "@/components/ui/illustrations";'
    )

pattern = re.compile(r'\{searchError && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, y: -10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: -10 \}\}\s*className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400"\s*>\s*\{" "\}\s*<AlertCircle className="h-5 w-5 mt-0\.5 shrink-0" />\{" "\}\s*<p className="text-sm font-medium">\{searchError\}</p>\{" "\}\s*</motion\.div>\s*\)\}\{" "\}')

new_error = """{searchError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 p-8 bg-muted/30 border border-border/50 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm"
                  >
                    <NoResultsIllustration className="mb-4 text-slate-400 dark:text-slate-500 drop-shadow-sm" />
                    <h3 className="text-base font-bold text-foreground">No Results Found</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm">{searchError}</p>
                  </motion.div>
                )}{" "}"""

if pattern.search(content):
    content = pattern.sub(new_error, content)
    with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated warranty finder with NoResultsIllustration")
else:
    print("Could not find searchError state in warranty finder using regex")
