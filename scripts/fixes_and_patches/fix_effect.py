with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = re.sub(r'if \(subIndex === 0 && !isDeleting && index === 0\) \{\s*setSubIndex\(activeQuotes\[0\]\?\.length \|\| 0\);\s*\}', r'if (!isDeleting && index === 0) {\n      setSubIndex(activeQuotes[0]?.length || 0);\n    }', content)

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
