const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = '  const isCancellation = false;';
const replacement = `  const isCancellation = false;
  const assetTransferInput = "";
  const childDetailsComponentInput = "";
  const cancellationExecutionInput = "";
  const cancellationStoredRows: any[] = [];`;

code = code.replace(target, replacement);

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Fixed more TDZ for leftover states!');
