import re

with open("frontend/components/layout/shell.tsx", "r", encoding="utf-8") as f:
    shell = f.read()

# Make background deeper
shell = shell.replace('dark:bg-[#020813]', 'dark:bg-[#010309]')

# Top left blue
shell = shell.replace('dark:bg-blue-600/15', 'dark:bg-blue-500/30 blur-[150px]')
# Top right orange
shell = shell.replace('dark:bg-purple-600/15', 'dark:bg-orange-500/25 blur-[150px]')
# Bottom left cyan/indigo
shell = shell.replace('dark:bg-sky-500/10', 'dark:bg-cyan-500/20 blur-[150px]')

with open("frontend/components/layout/shell.tsx", "w", encoding="utf-8") as f:
    f.write(shell)

print("Updated shell.tsx for richer background glows")
