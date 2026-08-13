const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = '  const [caseAssignMode, setCaseAssignMode] = React.useState<"round-robin" | "balanced" | "quantity">("round-robin");';
const replacement = `  const [caseAssignOutput, setCaseAssignOutput] = React.useState("");
  const [caseAssignmentResult, setCaseAssignmentResult] = React.useState<any | null>(null);
  const [caseAssignMode, setCaseAssignMode] = React.useState<"round-robin" | "balanced" | "quantity">("round-robin");
  const [caseOwnerAction, setCaseOwnerAction] = React.useState<string | null>(null);`;

code = code.replace(target, replacement);

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Fixed more case assignment state variables!');
