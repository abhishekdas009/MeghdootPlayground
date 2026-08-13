const fs = require('fs');

['TicketCancellationTool.tsx', 'CaseAssignmentTool.tsx', 'StandardSOQLGenerator.tsx'].forEach(file => {
    const path = 'components/soql-generator/' + file;
    let code = fs.readFileSync(path, 'utf-8');
    
    // Add templatePicker prop. The regex will match `export function TicketCancellationTool() {`
    const regex = new RegExp(`export function ${file.replace('.tsx', '')}\\(\\) \\{`);
    code = code.replace(regex, `export function ${file.replace('.tsx', '')}({ templatePicker }: { templatePicker?: React.ReactNode }) {`);
    
    // Render it right after the wrapper div
    code = code.replace(/<div className="space-y-6 w-full.*?>/, '$&\n    {templatePicker}');
    
    fs.writeFileSync(path, code);
    console.log('Fixed ' + file);
});
