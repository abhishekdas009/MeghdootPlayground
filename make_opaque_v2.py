import sys

with open('frontend/components/ui/translucent-date-picker.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-white/85 dark:bg-black/85 backdrop-blur-3xl', 'bg-white/95 dark:bg-[#1f1615]/95 backdrop-blur-3xl')

with open('frontend/components/ui/translucent-date-picker.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
