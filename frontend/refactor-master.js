const fs = require('fs');
const file = 'app/soql-generator/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add imports
content = content.replace(
  'import { trackDashboardEvent } from "@/lib/dashboard-tracker";',
  'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\nimport { AssetTransferTool } from "@/components/soql-generator/AssetTransferTool";\nimport { ChildDetailsToParentTool } from "@/components/soql-generator/ChildDetailsToParentTool";'
);

// 2. Remove states for Asset Transfer
content = content.replace(/  const \[assetTransferInput, setAssetTransferInput[\s\S]*?const \[transferDebug, setTransferDebug\] = React\.useState\(""\);\n/, '');
content = content.replace(/  const \[trackedAssetPairsCount, setTrackedAssetPairsCount\] = React\.useState\(0\);\n/, '');

// 3. Remove memos and effects for Asset Transfer
content = content.replace(/  const assetPairs = React\.useMemo[\s\S]*?\}, \[assetPairs\.length, isAssetTransfer, trackedAssetPairsCount\]\);\n/, '');
content = content.replace(/  const hasAssetTransferRun = assetPairs\.length > 0 && transferOutput\.length > 0;\n/, '');

// 4. Remove Asset Transfer functions
content = content.replace(/  const handleProcessTransfer = \(\) => \{[\s\S]*?toast\.success\("Asset transfer CSV downloaded"\);\n  \};\n/, '');

// 5. Remove Child Details states
content = content.replace(/  const \[childDetailsComponentInput, setChildDetailsComponentInput\] = React\.useState\(""\);\n  const \[childDetailsSOQLResult, setChildDetailsSOQLResult\] = React\.useState\(""\);\n  const \[childDetailsOutput, setChildDetailsOutput\] = React\.useState\(""\);\n  const \[childDetailsTransformResult, setChildDetailsTransformResult\] = React\.useState<ChildDetailsParentTransformResult \| null>\(null\);\n  const \[childDetailsBatchIndex, setChildDetailsBatchIndex\] = React\.useState\(0\);\n/g, '');

// 6. Remove Child Details memos and variables
content = content.replace(/  const childDetailsComponentParse = React\.useMemo\([\s\S]*?\), \[childDetailsComponentInput\]\);\n/g, '');
content = content.replace(/  const childDetailsComponentIds = childDetailsComponentParse\.componentIds;\n/g, '');
content = content.replace(/  const childDetailsSOQLBatches = React\.useMemo\([\s\S]*?\[childDetailsComponentIds\]\);\n/g, '');
content = content.replace(/  const childDetailsCurrentSOQLBatch = childDetailsSOQLBatches\[childDetailsBatchIndex\] \?\? childDetailsSOQLBatches\[0\] \?\? "";\n/g, '');
content = content.replace(/  const childDetailsValidationPreview = React\.useMemo\([\s\S]*?\[childDetailsComponentIds, childDetailsSOQLResult\]\);\n/g, '');
content = content.replace(/  const childDetailsVisibleResult = childDetailsTransformResult \?\? childDetailsValidationPreview;\n/g, '');
content = content.replace(/  const childDetailsInvalidIdCount =[\s\S]*?\(childDetailsVisibleResult\?\.invalidParentAccountIdRows \?\? 0\);\n/g, '');
content = content.replace(/  const childDetailsMissingParentAccountCount =[\s\S]*?\(childDetailsVisibleResult\?\.invalidParentAccountIdRows \?\? 0\);\n/g, '');
content = content.replace(/  const childDetailsValidationIssues = React\.useMemo\([\s\S]*?\[childDetailsInvalidIdCount, childDetailsVisibleResult\]\);\n/g, '');

// 7. Remove Child Details functions
content = content.replace(/  const handleGenerateChildDetailsParentCsv = \(\) => \{[\s\S]*?skippedMessage\n    \);\n  \};\n/g, '');
content = content.replace(/  const handleDownloadChildDetailsQuery = \(\) => \{[\s\S]*?toast\.success\("Queries downloaded"\);\n  \};\n/g, '');
content = content.replace(/  const handleDownloadChildDetailsOutput = \(\) => \{[\s\S]*?toast\.success\("Update CSV downloaded"\);\n  \};\n/g, '');

// 8. Remove combined handleClear resets
content = content.replace(/    setAssetTransferInput\(""\);\n    setAssetSOQLResult\(""\);\n    setAccountSOQLResult\(""\);\n    setTransferOutput\(""\);\n    setTransferDebug\(""\);\n/g, '');
content = content.replace(/    setChildDetailsComponentInput\(""\);\n    setChildDetailsSOQLResult\(""\);\n    setChildDetailsOutput\(""\);\n    setChildDetailsTransformResult\(null\);\n    setChildDetailsBatchIndex\(0\);\n/g, '');

// 9. Remove combined handleGenerate resets inside triggerGenerate
content = content.replace(/    if \(isChildDetailsToParent\) \{[\s\S]*?return;\n    \}\n\n    if \(isAssetTransfer\) \{[\s\S]*?return;\n    \}\n/g, '');

// 10. Remove Child Details stats
content = content.replace(/  const childDetailsInputStats = \[[\s\S]*?\];\n/g, '');
content = content.replace(/  const childDetailsSummaryStats = \[[\s\S]*?\];\n/g, '');

// 11. Extract templatePickerCard
const pickerCode = `
  const templatePickerCard = (
    <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden group">
      <CardHeader className="pb-4 bg-transparent relative z-10 p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Query Template</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 whitespace-nowrap text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-widest">
              {defaultTemplateCount} Built-in
            </Badge>
            <Badge className="text-[10px] font-black bg-blue-500/10 dark:bg-blue-900/30 px-3 py-1 whitespace-nowrap text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm uppercase tracking-widest flex items-center gap-1.5">
              <Cloud className="h-3 w-3" />
              {libraryTemplateCount} Library
            </Badge>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-2">Select a task type</p>
        <TemplatePicker
          templates={templates}
          value={selectedTemplate}
          onChange={handleTemplateChange}
        />
      </CardHeader>
    </Card>
  );

  return (`;

// Only replace the FIRST 'return (' in the component
content = content.replace(/  return \(\n    <div className="workspace-page/g, pickerCode + '\n    <div className="workspace-page');

// Replace the original Template Picker block where it's used
const originalPickerRegex = /<Card className="rounded-3xl border border-slate-200\/50 bg-white\/45 shadow-none backdrop-blur-xl dark:border-white\/10 dark:bg-slate-950\/45 overflow-hidden group">[\s\S]*?<TemplatePicker[\s\S]*?\/>\s*<\/CardHeader>\s*<\/Card>/;
content = content.replace(originalPickerRegex, '{templatePickerCard}');

// 12. Remove JSX blocks for Asset Transfer and Child Details in Left Pane
content = content.replace(/          \{isAssetTransfer && \([\s\S]*?<\/Card>\n          \)\}/, '');
content = content.replace(/          \{isChildDetailsToParent && \([\s\S]*?<\/Card>\n          \)\}/, '');

// 13. Remove JSX blocks for Asset Transfer and Child Details in Right Pane
content = content.replace(/          \{isAssetTransfer && \([\s\S]*?\}\n            <\/Card>\n          \)\}/, '');
content = content.replace(/          \{isChildDetailsToParent && \([\s\S]*?<\/Card>\n              <\/div>\n            <\/div>\n          \)\}/, '');

// 14. Inject the tools in the grid!
const gridStart = '<div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">';
content = content.replace(
  gridStart,
  `${gridStart}\n        {isAssetTransfer ? <AssetTransferTool templatePicker={templatePickerCard} /> : isChildDetailsToParent ? <ChildDetailsToParentTool templatePicker={templatePickerCard} /> : <>\n`
);

// Close the fragment
const wrapperEnd = `      </div>\n    </div>\n  );\n}`;
content = content.replace(
  wrapperEnd,
  `        </>}\n      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync(file, content);
console.log("Master refactor applied!");
