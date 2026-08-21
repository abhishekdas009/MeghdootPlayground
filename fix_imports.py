import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to remove the broken Tooltip import I just injected.
# It looks like: 'import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";\n'

new_lines = []
for line in lines:
    if 'import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";' in line:
        continue
    new_lines.append(line)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Fixed imports!')
