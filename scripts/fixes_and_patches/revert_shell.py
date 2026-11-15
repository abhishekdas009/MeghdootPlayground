import sys
import re

with open('frontend/components/layout/shell.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the useGlobalTilt function completely
content = re.sub(r'function useGlobalTilt\(\) \{[\s\S]*?\}\n\nexport function Shell', 'export function Shell', content)

# Remove the call to useGlobalTilt() inside Shell
content = re.sub(r'  const \{ sidebarCollapsed \} = useUIStore\(\);\s*useGlobalTilt\(\);', '  const { sidebarCollapsed } = useUIStore();', content)

with open('frontend/components/layout/shell.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
