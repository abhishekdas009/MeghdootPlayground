import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove max-h from Pre block
text = text.replace(
    'min-h-[140px] max-h-[400px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100',
    'min-h-0 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100'
)

# 2. Remove max-h from Textarea
text = text.replace(
    'min-h-[140px] max-h-[400px]',
    'min-h-[140px]'
)

# 3. Remove max-h from Roster List, but let's give it a min-h-0 so it doesn't force the height (or wait, let's keep min-h-[200px] to ensure the card is at least decently tall!)
text = text.replace(
    'min-h-[200px] max-h-[400px]',
    'min-h-[200px]'
)

# 4. Remove max-h from Left Sidebar Drag&Drop
text = text.replace(
    'min-h-[320px] max-h-[600px]',
    'min-h-[320px]'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Empty gaps removed!')
