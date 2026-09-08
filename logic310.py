import re
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { SOQLHighlighter } from "@/components/ui/soql-highlighter";\n'
if "SOQLHighlighter" not in content:
    content = content.replace(
        'import { Textarea } from "@/components/ui/textarea";',
        'import { Textarea } from "@/components/ui/textarea";\nimport { SOQLHighlighter } from "@/components/ui/soql-highlighter";'
    )

# The pattern looks for `<pre className="...">{variable}</pre>`
# Let's do it carefully.

pattern = re.compile(r'<pre className=\{?`?([^>]+)`?\}?>\s*\{([^}]+)\}\s*</pre>')
# Wait, some have template literals for classes: className={`... ${...}`}
# Some have just strings: className="abc"

def repl(match):
    # This might match other pre tags. We only want to replace if the inner content contains 'SOQL' or is 'transformedValue'
    inner = match.group(2).strip()
    cls = match.group(1).strip()
    
    # Check if it looks like a SOQL variable (contains SOQL or is transformedValue or query)
    if 'SOQL' in inner or 'transformedValue' in inner or 'generated' in inner:
        # Check if the class was a template literal or string
        if '?' in cls or '$' in cls:
            return f'<SOQLHighlighter query={{{inner}}} className={{`{cls}`}} />'
        else:
            cls = cls.replace('"', '').replace('`', '')
            return f'<SOQLHighlighter query={{{inner}}} className="{cls}" />'
    return match.group(0)

new_content = pattern.sub(repl, content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Updated page.tsx with SOQLHighlighter")
