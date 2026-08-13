const fs = require('fs');
let code = fs.readFileSync('components/soql-generator/CaseAssignmentTool.tsx', 'utf-8');

const target = '  const [autoRunPending, setAutoRunPending] = React.useState(false);';
const replacement = `  const [autoRunPending, setAutoRunPending] = React.useState(false);
  const [caseOwners, setCaseOwners] = React.useState<any[]>([]);
  const [caseOwnerLoadState, setCaseOwnerLoadState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [selectedOwnerIds, setSelectedOwnerIds] = React.useState<string[]>([]);
  const [quantityOwnerConfigs, setQuantityOwnerConfigs] = React.useState<any[]>([]);
  const [caseAssignMode, setCaseAssignMode] = React.useState<"round-robin" | "balanced" | "quantity">("round-robin");
  const [roundRobinPointer, setRoundRobinPointer] = React.useState<number>(0);
  const [roundRobinHistory, setRoundRobinHistory] = React.useState<any[]>([]);
  const [cumulativeLoad, setCumulativeLoad] = React.useState<Record<string, { total: number, extra: number }>>({});

  const activeCaseOwners = React.useMemo(() => {
    const ownerIds = new Set<string>();
    return caseOwners.filter((owner) => {
      const normalizedOwnerId = owner.ownerId.trim();
      if (!owner.isActive || !normalizedOwnerId || ownerIds.has(normalizedOwnerId)) return false;
      ownerIds.add(normalizedOwnerId);
      return true;
    });
  }, [caseOwners]);

  React.useEffect(() => {
    setSelectedOwnerIds(activeCaseOwners.map((owner) => owner.ownerId));
    setQuantityOwnerConfigs((previous) => {
      const previousMap = new Map(previous.map((item) => [item.ownerId, item]));
      return activeCaseOwners.map((owner) => {
        const existing = previousMap.get(owner.ownerId);
        return {
          id: owner.id,
          name: owner.name,
          ownerId: owner.ownerId,
          selected: existing?.selected ?? true,
          quantity: existing?.quantity ?? "",
        };
      });
    });
  }, [activeCaseOwners]);`;

code = code.replace(target, replacement);

fs.writeFileSync('components/soql-generator/CaseAssignmentTool.tsx', code);
console.log('Fixed case owners TDZ!');
