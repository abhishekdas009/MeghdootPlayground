const fs = require('fs');

['TicketCancellationTool.tsx', 'CaseAssignmentTool.tsx'].forEach(file => {
    let code = fs.readFileSync('components/soql-generator/' + file, 'utf-8');
    
    const lines = code.split('\n');
    const startIdx = lines.findIndex(l => l.includes('const parsedTickets = React.useMemo('));
    if (startIdx !== -1) {
        let endIdx = startIdx;
        while (!lines[endIdx].includes('];')) endIdx++;
        
        const extracted = lines.slice(startIdx, endIdx + 1).join('\n');
        
        code = code.replace(extracted, '');
        
        // Insert right after const [ticketsInput, setTicketsInput]
        const insertAfter = 'const [ticketsInput, setTicketsInput] = React.useState("");';
        code = code.replace(insertAfter, insertAfter + '\n\n  ' + extracted);
        
        fs.writeFileSync('components/soql-generator/' + file, code);
        console.log('Fixed TDZ for ' + file);
    }
});
