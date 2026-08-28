import sys

with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    shell = f.read()

# Replace dark:bg-white/5 with dark:hidden
shell = shell.replace('dark:bg-white/5 dark:blur-[150px] dark:mix-blend-normal', 'dark:hidden')

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(shell)

print("Success")
