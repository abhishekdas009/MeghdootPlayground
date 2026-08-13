const fs = require('fs');
let content = fs.readFileSync('lib/soql-generator-utils.ts', 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
fs.writeFileSync('lib/soql-generator-utils.ts', content);
