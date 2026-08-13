const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/TicketCancellationTool.tsx', 'utf-8');

const regex = /const cancellationFailedTickets = Array\.from\(new Set\(cancellationFailedInput\.match\(\/\\b\[a-zA-Z\]\\d\{5,20\}\\b\/g\) \|\| \[\]\)\);/;

const replacement = `
                let missingRemarkTickets = [];
                let otherFailedTickets = [];
                
                if (hasFailedInput) {
                  const lines = cancellationFailedInput.split('\\n').slice(1); // skip header
                  lines.forEach(line => {
                    const match = line.match(/\\b[a-zA-Z]\\d{5,20}\\b/);
                    if (match) {
                      const ticket = match[0];
                      if (line.toLowerCase().includes('remark') || line.toLowerCase().includes('reason')) {
                        missingRemarkTickets.push(ticket);
                      } else {
                        otherFailedTickets.push(ticket);
                      }
                    }
                  });
                  missingRemarkTickets = Array.from(new Set(missingRemarkTickets));
                  otherFailedTickets = Array.from(new Set(otherFailedTickets));
                }
                const cancellationFailedTickets = [...missingRemarkTickets, ...otherFailedTickets];
`;

code = code.replace(regex, replacement);

const mailRegex = /const mailTemplateText = \`Dear,\\nCancellation has been done successfully\.\\n\\n\` \+[\s\S]*?Failed Tickets: \$\{cancellationFailedCount\}\`;/s;
const postRegex = /const postTemplateText = \`@taguser \\nCancellation has been done successfully\.\\n\\n\` \+[\s\S]*?Failed Tickets: \$\{cancellationFailedCount\}\`;/s;

const newMail = `const mailTemplateText = \`Dear,\\nCancellation has been done successfully.\\n\\n\` +
                  (hasFailedInput && otherFailedTickets.length > 0 ? \`Failed Tickets:\\n\${otherFailedTickets.join("\\n")}\\n\\n\` : "") +
                  (hasFailedInput && missingRemarkTickets.length > 0 ? \`Skipped (Remark Missing):\\n\${missingRemarkTickets.join("\\n")}\\n\\n\` : "") +
                  \`Total Tickets: \${cancellationTotalTickets}\\n\` +
                  \`Cancelled Tickets: \${cancellationSuccessCount}\\n\` +
                  \`Failed Tickets: \${cancellationFailedCount}\` +
                  (hasFailedInput && missingRemarkTickets.length > 0 ? \`\\nSkipped for remark missing: \${missingRemarkTickets.length}\` : "");`;

const newPost = `const postTemplateText = \`@taguser \\nCancellation has been done successfully.\\n\\n\` +
                  (hasFailedInput && otherFailedTickets.length > 0 ? \`Failed Tickets:\\n\${otherFailedTickets.join("\\n")}\\n\\n\` : "") +
                  (hasFailedInput && missingRemarkTickets.length > 0 ? \`Skipped (Remark Missing):\\n\${missingRemarkTickets.join("\\n")}\\n\\n\` : "") +
                  \`Total Tickets: \${cancellationTotalTickets}\\n\` +
                  \`Cancelled Tickets: \${cancellationSuccessCount}\\n\` +
                  \`Failed Tickets: \${cancellationFailedCount}\` +
                  (hasFailedInput && missingRemarkTickets.length > 0 ? \`\\nSkipped for remark missing: \${missingRemarkTickets.length}\` : "");`;

code = code.replace(mailRegex, newMail);
code = code.replace(postRegex, newPost);

fs.writeFileSync('components/soql-generator/TicketCancellationTool.tsx', code);
console.log('Fixed mail templates!');
