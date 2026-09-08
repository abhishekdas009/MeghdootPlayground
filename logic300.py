with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { EmptyActivityIllustration } from "@/components/ui/illustrations";\n'
if "EmptyActivityIllustration" not in content:
    content = content.replace(
        'import { ThemeCustomizer } from "@/components/layout/theme-customizer";',
        'import { ThemeCustomizer } from "@/components/layout/theme-customizer";\nimport { EmptyActivityIllustration } from "@/components/ui/illustrations";'
    )

old_empty = """                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-extrabold text-foreground">You&apos;re all caught up</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New workspace activity will appear here.</p>
                  </div>
                )"""

new_empty = """                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
                    <EmptyActivityIllustration className="mb-3 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
                    <p className="text-sm font-extrabold text-foreground">You&apos;re all caught up</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New workspace activity will appear here.</p>
                  </div>
                )"""

if old_empty in content:
    content = content.replace(old_empty, new_empty)
    with open("frontend/components/layout/header.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated header with EmptyActivityIllustration")
else:
    print("Could not find empty state in header")
