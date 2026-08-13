const fs = require('fs');
const code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const regex = /const \[ticketsInput, setTicketsInput\] = React\.useState\(""\);/;
const insertAfter = `
  const [trackedCaseAssignCount, setTrackedCaseAssignCount] = React.useState(0);

  React.useEffect(() => {
    if (isCaseAssign && parsedTickets.length > trackedCaseAssignCount) {
      const diff = parsedTickets.length - trackedCaseAssignCount;
      trackDashboardEvent({
        metricKey: "case_assignment",
        incrementBy: diff,
        event: {
          type: "Case Assignment Setup",
          label: \`Configured assignment for \${diff} ticket\${diff === 1 ? "" : "s"}\`,
          module: "case-assignment",
        }
      });
      setTrackedCaseAssignCount(parsedTickets.length);
    } else if (parsedTickets.length === 0 && trackedCaseAssignCount > 0) {
      setTrackedCaseAssignCount(0);
    }
  }, [parsedTickets.length, isCaseAssign, trackedCaseAssignCount]);
`;

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code.replace(regex, '$&\n' + insertAfter));
console.log('Added useEffect to CaseAssignmentTool');
