with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# find lucide-react import block and add CornerRightUp
pattern = r'(import \{[^}]*)\}( from "lucide-react";)'
match = re.search(pattern, content)
if match:
    if "CornerRightUp" not in match.group(1):
        new_import = match.group(1) + "  CornerRightUp,\n}" + match.group(2)
        content = content[:match.start()] + new_import + content[match.end():]
        with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
            f.write(content)
        print("Success 80")
    else:
        print("Already exists")
else:
    print("Could not find import block")
