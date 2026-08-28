with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find the activeQuotes line
pattern = r'const activeQuotes = festival \? \[`\$\{festival\.wishes\} \$\{festival\.quote\}`\] : QUOTES;'
replacement = 'const activeQuotes = React.useMemo(() => festival ? [`${festival.wishes} ${festival.quote}`] : QUOTES, [festival]);'

content = re.sub(pattern, replacement, content)

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
