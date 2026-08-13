const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = '    () => parseComponentIds(childDetailsComponentInput),';
const missingCode = `
  const [trackedCaseAssignCount, setTrackedCaseAssignCount] = React.useState(0);

  const parsedTickets = React.useMemo(
    () => parsedCaseIds,
    [parsedCaseIds]
  );

  React.useEffect(() => {
    if (parsedTickets.length > trackedCaseAssignCount) {
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
  }, [parsedTickets.length, trackedCaseAssignCount]);

  const inputBatchSize = isCancellation ? CANCELLATION_BATCH_SIZE : SOQL_BATCH_SIZE;
  const inputBatchCount = parsedTickets.length > 0 ? Math.ceil(parsedTickets.length / inputBatchSize) : 0;
  const ticketStats = React.useMemo(() => getTicketStats(parsedTickets), [parsedTickets]);
  const assetPairs = React.useMemo(() => parseAssetTransferPairs(assetTransferInput), [assetTransferInput]);
  const childDetailsComponentParse = React.useMemo(
`;

code = code.replace(target, missingCode + target);
fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Restored missing code');
