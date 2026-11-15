import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add roundRobinPointerOwnerWise state
text = text.replace(
    'const [roundRobinPointer, setRoundRobinPointer] = React.useState<number>(0);',
    'const [roundRobinPointer, setRoundRobinPointer] = React.useState<number>(0);\n  const [roundRobinPointerOwnerWise, setRoundRobinPointerOwnerWise] = React.useState<number>(0);'
)

# 2. Add loading it from localStorage
load_str = '''        if (storedPointer) setRoundRobinPointer(parseInt(storedPointer, 10) || 0);'''
load_str_new = '''        if (storedPointer) setRoundRobinPointer(parseInt(storedPointer, 10) || 0);

        const storedPointerOW = localStorage.getItem("caseAssignmentRoundRobinOwnerWise");
        if (storedPointerOW) setRoundRobinPointerOwnerWise(parseInt(storedPointerOW, 10) || 0);'''
text = text.replace(load_str, load_str_new)

# 3. Update handleRunCaseAssignment for owner-wise mode
old_owner_wise = '''    } else if (caseAssignMode === "owner-wise") {
      if (!selectedOwnerObjects.length) {
        toast.error("Select at least one owner");
        return;
      }

      result = buildBalancedAssignments(caseAssignmentRows, selectedOwnerObjects);
    } else {'''

new_owner_wise = '''    } else if (caseAssignMode === "owner-wise") {
      if (!selectedOwnerObjects.length) {
        toast.error("Select at least one owner");
        return;
      }

      result = buildBalancedAssignments(caseAssignmentRows, selectedOwnerObjects, roundRobinPointerOwnerWise);

      if (result.nextPointer !== undefined && result.startOwner && result.nextStartOwner && result.extraOwners) {
        setRoundRobinPointerOwnerWise(result.nextPointer);
        localStorage.setItem("caseAssignmentRoundRobinOwnerWise", result.nextPointer.toString());

        const newHistoryEntry: RoundRobinHistoryEntry = {
          batchId: roundRobinHistory.length > 0 ? roundRobinHistory[0]!.batchId + 1 : 1,
          totalCases: caseAssignmentRows.length,
          baseCases: result.casesPerOwner,
          extraCases: result.remainder ?? 0,
          extraOwners: result.extraOwners,
          startOwner: result.startOwner,
          nextStartOwner: result.nextStartOwner,
          timestamp: new Date().toISOString(),
        };
        const updatedHistory = [newHistoryEntry, ...roundRobinHistory].slice(0, 10);
        setRoundRobinHistory(updatedHistory);
        localStorage.setItem("caseAssignmentHistory", JSON.stringify(updatedHistory));

        const updatedLoad = { ...cumulativeLoad };
        selectedOwnerObjects.forEach((owner) => {
          if (!updatedLoad[owner.ownerId]) {
            updatedLoad[owner.ownerId] = { total: 0, extra: 0 };
          }
          updatedLoad[owner.ownerId]!.total += result.casesPerOwner;
        });
        result.extraOwners.forEach((owner) => {
          updatedLoad[owner.ownerId]!.total += 1;
          updatedLoad[owner.ownerId]!.extra += 1;
        });
        setCumulativeLoad(updatedLoad);
        localStorage.setItem("caseAssignmentCumulativeLoad", JSON.stringify(updatedLoad));
      }
    } else {'''

text = text.replace(old_owner_wise, new_owner_wise)

# 4. Show Round Robin UI Cards for owner-wise as well
# Find: {caseAssignmentResult && caseAssignMode === "equal" && (
text = text.replace(
    '{caseAssignmentResult && caseAssignMode === "equal" && (',
    '{caseAssignmentResult && (caseAssignMode === "equal" || caseAssignMode === "owner-wise") && ('
)

# 5. Fix "Active Owners" text in the UI card
active_owners_ui = '''                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Active Owners</span>
                        <div className="font-black text-sm">{activeCaseOwners.length}</div>
                      </div>'''

active_owners_ui_new = '''                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{caseAssignMode === "owner-wise" ? "Selected Owners" : "Active Owners"}</span>
                        <div className="font-black text-sm">{caseAssignMode === "owner-wise" ? selectedOwnerObjects.length : activeCaseOwners.length}</div>
                      </div>'''
text = text.replace(active_owners_ui, active_owners_ui_new)

# 6. Change description text in owner-wise selector to reflect that remainders are now distributed!
old_desc = '''Selected owners receive an equal whole-number share after the Case IDs are shuffled. Any remainder stays unassigned.'''
new_desc = '''Selected owners receive an equal whole-number share. Any remainders are distributed 1-by-1 to ensure no cases are unassigned.'''
text = text.replace(old_desc, new_desc)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Owner Wise Round Robin implemented!')
