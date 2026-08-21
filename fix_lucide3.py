import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('  Ban,\n  Box,\n  Briefcase,\n  Calendar,\n  FileText,\n} from "lucide-react";', '  Ban,\n  Box,\n  Briefcase,\n  Calendar,\n  FileText,\n  UploadCloud,\n  ClipboardPaste,\n} from "lucide-react";')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Added UploadCloud, ClipboardPaste!')
