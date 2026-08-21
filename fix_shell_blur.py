import re

with open("frontend/components/layout/shell.tsx", "r", encoding="utf-8") as f:
    shell = f.read()

shell = shell.replace('blur-[120px] dark:bg-blue-500/30 blur-[150px]', 'blur-[120px] dark:bg-blue-500/30 dark:blur-[150px]')
shell = shell.replace('blur-[120px] dark:bg-orange-500/25 blur-[150px]', 'blur-[120px] dark:bg-orange-500/25 dark:blur-[150px]')
shell = shell.replace('blur-[120px] dark:bg-cyan-500/20 blur-[150px]', 'blur-[120px] dark:bg-cyan-500/20 dark:blur-[150px]')

with open("frontend/components/layout/shell.tsx", "w", encoding="utf-8") as f:
    f.write(shell)
