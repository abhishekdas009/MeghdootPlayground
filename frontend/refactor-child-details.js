const fs = require('fs');
const file = 'app/soql-generator/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add import
if (!content.includes('import { ChildDetailsToParentTool }')) {
  content = content.replace(
    'import { AssetTransferTool } from "@/components/soql-generator/AssetTransferTool";',
    'import { AssetTransferTool } from "@/components/soql-generator/AssetTransferTool";\nimport { ChildDetailsToParentTool } from "@/components/soql-generator/ChildDetailsToParentTool";'
  );
  if (!content.includes('ChildDetailsToParentTool')) { // fallback if AssetTransferTool is not there
    content = content.replace(
      'import { trackDashboardEvent } from "@/lib/dashboard-tracker";',
      'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\nimport { ChildDetailsToParentTool } from "@/components/soql-generator/ChildDetailsToParentTool";'
    );
  }
}

// 2. Remove states
content = content.replace(/  const \[childDetailsComponentInput, setChildDetailsComponentInput\] = React\.useState\(""\);\n  const \[childDetailsSOQLResult, setChildDetailsSOQLResult\] = React\.useState\(""\);\n  const \[childDetailsOutput, setChildDetailsOutput\] = React\.useState\(""\);\n  const \[childDetailsTransformResult, setChildDetailsTransformResult\] = React\.useState<ChildDetailsParentTransformResult \| null>\(null\);\n  const \[childDetailsBatchIndex, setChildDetailsBatchIndex\] = React\.useState\(0\);\n/g, '');

// 3. Remove memos and variables
content = content.replace(/  const childDetailsComponentParse = React\.useMemo\([\s\S]*?\), \[childDetailsComponentInput\]\);\n/g, '');
content = content.replace(/  const childDetailsComponentIds = childDetailsComponentParse\.componentIds;\n/g, '');
content = content.replace(/  const childDetailsSOQLBatches = React\.useMemo\([\s\S]*?\[childDetailsComponentIds\]\);\n/g, '');
content = content.replace(/  const childDetailsCurrentSOQLBatch = childDetailsSOQLBatches\[childDetailsBatchIndex\] \?\? childDetailsSOQLBatches\[0\] \?\? "";\n/g, '');
content = content.replace(/  const childDetailsValidationPreview = React\.useMemo\([\s\S]*?\[childDetailsComponentIds, childDetailsSOQLResult\]\);\n/g, '');
content = content.replace(/  const childDetailsVisibleResult = childDetailsTransformResult \?\? childDetailsValidationPreview;\n/g, '');
content = content.replace(/  const childDetailsInvalidIdCount =[\s\S]*?\(childDetailsVisibleResult\?\.invalidParentAccountIdRows \?\? 0\);\n/g, '');
content = content.replace(/  const childDetailsMissingParentAccountCount =[\s\S]*?\(childDetailsVisibleResult\?\.invalidParentAccountIdRows \?\? 0\);\n/g, '');
content = content.replace(/  const childDetailsValidationIssues = React\.useMemo\([\s\S]*?\[childDetailsInvalidIdCount, childDetailsVisibleResult\]\);\n/g, '');

// 4. Remove functions
content = content.replace(/  const handleGenerateChildDetailsParentCsv = \(\) => \{[\s\S]*?skippedMessage\n    \);\n  \};\n/g, '');
content = content.replace(/  const handleDownloadChildDetailsQuery = \(\) => \{[\s\S]*?toast\.success\("Queries downloaded"\);\n  \};\n/g, '');
content = content.replace(/  const handleDownloadChildDetailsOutput = \(\) => \{[\s\S]*?toast\.success\("Update CSV downloaded"\);\n  \};\n/g, '');

// 5. Remove handleClear resets
content = content.replace(/    setChildDetailsComponentInput\(""\);\n    setChildDetailsSOQLResult\(""\);\n    setChildDetailsOutput\(""\);\n    setChildDetailsTransformResult\(null\);\n    setChildDetailsBatchIndex\(0\);\n/g, '');

// 6. Remove handleGenerate resets inside triggerGenerate
content = content.replace(/    if \(isChildDetailsToParent\) \{[\s\S]*?return;\n    \}\n/g, '');

// 7. Remove stats
content = content.replace(/  const childDetailsInputStats = \[[\s\S]*?\];\n/g, '');
content = content.replace(/  const childDetailsSummaryStats = \[[\s\S]*?\];\n/g, '');

// 8. Refactor the Grid and JSX
// Replace {isChildDetailsToParent && ...} left pane block
content = content.replace(/          \{isChildDetailsToParent && \([\s\S]*?<\/Card>\n          \)\}/, '');

// Replace {isChildDetailsToParent && ...} right pane block
content = content.replace(/          \{isChildDetailsToParent && \([\s\S]*?<\/Card>\n              <\/div>\n            <\/div>\n          \)\}/, '');

// Update the rendering logic to use ChildDetailsToParentTool instead of <></> 
const targetBlock = `{isAssetTransfer ? <AssetTransferTool templatePicker={templatePickerCard} /> : <>`;
if (content.includes(targetBlock)) {
  content = content.replace(
    targetBlock,
    `{isAssetTransfer ? <AssetTransferTool templatePicker={templatePickerCard} /> : isChildDetailsToParent ? <ChildDetailsToParentTool templatePicker={templatePickerCard} /> : <>`
  );
} else {
  // Try matching original
  const gridStart = '<div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">';
  if (!content.includes('ChildDetailsToParentTool templatePicker')) {
    content = content.replace(
      gridStart,
      `${gridStart}\n        {isAssetTransfer ? <AssetTransferTool templatePicker={templatePickerCard} /> : isChildDetailsToParent ? <ChildDetailsToParentTool templatePicker={templatePickerCard} /> : <>\n`
    );
  }
}

fs.writeFileSync(file, content);
console.log("ChildDetailsToParent refactor applied!");
