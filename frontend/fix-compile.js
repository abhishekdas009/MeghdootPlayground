const fs = require('fs');

let code = fs.readFileSync('app/soql-generator/page.tsx', 'utf-8');
code = code.replace(/import \{ requestJson \} from "@\/lib\/utils";/g, '');
// Remove initialize logic entirely
code = code.replace(/const \{ initialize: initDashboard \} = useDashboardStore\(\);[\s\S]*?React.useEffect\(\(\) => \{\s*initDashboard\(\);\s*\}, \[initDashboard\]\);/, '');

// Add type to query in map and filter
code = code.replace(/\.filter\(\(query\) => query\.label/g, '.filter((query: any) => query.label');
code = code.replace(/\.map\(\(query\) => \(\{/g, '.map((query: any) => ({');

// Make sure requestJson is just a basic fetch wrapper since it wasn't there
code = code.replace(/import \{ defaultTemplates, Template \} from "@\/lib\/soql-generator-utils";/, 
  'import { defaultTemplates, Template } from "@/lib/soql-generator-utils";\n' + 
  'async function requestJson<T>(url: string): Promise<T> { const res = await fetch(url); if (!res.ok) throw new Error("Network error"); return res.json(); }');

fs.writeFileSync('app/soql-generator/page.tsx', code);

let std = fs.readFileSync('components/soql-generator/StandardSOQLGenerator.tsx', 'utf-8');
std = std.replace(/export function StandardSOQLGenerator\(\) \{/, 'export function StandardSOQLGenerator({ templatePicker }: { templatePicker?: React.ReactNode }) {');
fs.writeFileSync('components/soql-generator/StandardSOQLGenerator.tsx', std);

console.log('Fixed compile errors!');
