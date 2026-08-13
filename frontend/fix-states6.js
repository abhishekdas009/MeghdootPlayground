const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = 'const CANCELLATION_BATCH_SIZE = 10;';
const replacement = `const CANCELLATION_BATCH_SIZE = 10;
const SOQL_BATCH_SIZE = 50;
const formatTicketsForSOQL = (tickets: string[]): string => tickets.map((t) => \`'\${t}'\`).join(", ");`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
} else {
  code = code.replace('import React', `const SOQL_BATCH_SIZE = 50;
const formatTicketsForSOQL = (tickets: string[]): string => tickets.map((t) => \`'\${t}'\`).join(", ");
import React`);
}

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Fixed formatTicketsForSOQL!');
