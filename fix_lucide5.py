import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('  ClipboardPaste,\n} from "lucide-react";', '  ClipboardPaste,\n  Sparkles,\n} from "lucide-react";')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Added Sparkles!')
