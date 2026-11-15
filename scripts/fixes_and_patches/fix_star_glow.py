import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_star_glow = '''                          ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-sm"'''
replacement_star_glow = '''                          ? "fill-amber-400 text-amber-400 scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"'''

if target_star_glow in content:
    content = content.replace(target_star_glow, replacement_star_glow)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added smooth animated glow to Favorite star")
else:
    print("Failed")
