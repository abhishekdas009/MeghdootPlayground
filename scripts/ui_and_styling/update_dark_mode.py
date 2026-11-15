import sys

# Update shell.tsx
with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    shell = f.read()

# Change the background blobs to be hidden in dark mode, or use a subtle monochrome glow
# Replace dark:bg-blue-500/30 with dark:bg-white/5
shell = shell.replace('dark:bg-blue-500/30', 'dark:bg-white/5')
shell = shell.replace('dark:bg-orange-500/25', 'dark:bg-white/5')
shell = shell.replace('dark:bg-cyan-500/20', 'dark:bg-white/5')
shell = shell.replace('dark:bg-[#010309]', 'dark:bg-[#302423]')

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(shell)

# Update globals.css
with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('background-color: #000000 !important;', 'background-color: #302423 !important;')

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Success")
