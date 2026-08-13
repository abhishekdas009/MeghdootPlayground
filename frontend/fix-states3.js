const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = '  const isCancellation = false;';
const replacement = `  const isCancellation = false;
  const [autoRunPending, setAutoRunPending] = React.useState(false);`;

code = code.replace(target, replacement);

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Fixed autoRunPending TDZ!');
