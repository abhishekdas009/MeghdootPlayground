import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all <PascalCase tags
tags = re.findall(r'<([A-Z][a-zA-Z0-9_]*)\b', text)
unique_tags = set(tags)

# Standard imports to ignore (from our own components or React)
ignore = {'Card', 'CardContent', 'CardHeader', 'CardTitle', 'CardDescription',
          'Button', 'Textarea', 'Badge', 'Select', 'SelectContent', 'SelectGroup',
          'SelectItem', 'SelectLabel', 'SelectTrigger', 'SelectValue',
          'Tooltip', 'TooltipTrigger', 'TooltipContent', 'TooltipProvider',
          'JsonViewer', 'MagneticButton', 'SmartPasteTextarea', 'AnimatedEmptyState',
          'TemplatePicker', 'QueryPreviewCard', 'DataGridTSV',
          'AnimatePresence', 'AreaChart', 'Area', 'XAxis', 'YAxis', 'CartesianGrid', 'ResponsiveContainer'}

missing = unique_tags - ignore

# Now check if they are already imported from lucide-react
import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"lucide-react"', text)
if import_match:
    lucide_imports = set(re.findall(r'([A-Za-z0-9_]+)', import_match.group(1)))
    missing = missing - lucide_imports

print("Potentially missing icons:", list(missing))
