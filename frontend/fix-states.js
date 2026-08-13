const fs = require('fs');

let std = fs.readFileSync('components/soql-generator/StandardSOQLGenerator.tsx', 'utf-8');
std = std.replace(/const \[selectedTemplate, setSelectedTemplate\] = React\.useState\(".*?"\);/, 'const [selectedTemplate, setSelectedTemplate] = React.useState("1");');
fs.writeFileSync('components/soql-generator/StandardSOQLGenerator.tsx', std);

let ca = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');
ca = ca.replace(/const \[selectedTemplate, setSelectedTemplate\] = React\.useState\(".*?"\);/, 'const [selectedTemplate, setSelectedTemplate] = React.useState("4");');
fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', ca);

console.log('Fixed states');
