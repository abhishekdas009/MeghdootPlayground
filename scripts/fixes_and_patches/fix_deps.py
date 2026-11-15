with open("frontend/components/ui/typewriter-quotes.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
pattern = r'useEffect\(\(\) => \{\s*if \(\!isMounted\) return;\s*// Set initial subIndex for hydration match\s*if \(\!isDeleting && index === 0\) \{\s*setSubIndex\(activeQuotes\[0\]\?\.length \|\| 0\);\s*\}\s*\}, \[isMounted, activeQuotes\]\);'

replacement = """useEffect(() => {
    if (!isMounted) return;
    // Set initial state for hydration match and when quotes change
    setSubIndex(activeQuotes[0]?.length || 0);
    setIndex(0);
    setIsDeleting(false);
  }, [isMounted, activeQuotes]);"""

content = re.sub(pattern, replacement, content)

with open("frontend/components/ui/typewriter-quotes.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
