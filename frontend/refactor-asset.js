const fs = require('fs');
const file = 'app/soql-generator/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add import
if (!content.includes('import { AssetTransferTool }')) {
  content = content.replace(
    'import { trackDashboardEvent } from "@/lib/dashboard-tracker";',
    'import { trackDashboardEvent } from "@/lib/dashboard-tracker";\nimport { AssetTransferTool } from "@/components/soql-generator/AssetTransferTool";'
  );
}

// 2. Remove states
content = content.replace(/  const \[assetTransferInput, setAssetTransferInput[\s\S]*?const \[transferDebug, setTransferDebug\] = React\.useState\(""\);\n/, '');
content = content.replace(/  const \[trackedAssetPairsCount, setTrackedAssetPairsCount\] = React\.useState\(0\);\n/, '');

// 3. Remove memos and effects
content = content.replace(/  const assetPairs = React\.useMemo[\s\S]*?\}, \[assetPairs\.length, isAssetTransfer, trackedAssetPairsCount\]\);\n/, '');
content = content.replace(/  const hasAssetTransferRun = assetPairs\.length > 0 && transferOutput\.length > 0;\n/, '');

// 4. Remove handleProcessTransfer and handleDownloadTransfer
content = content.replace(/  const handleProcessTransfer = \(\) => \{[\s\S]*?toast\.success\("Asset transfer CSV downloaded"\);\n  \};\n/, '');

// 5. Remove handleClear resets
content = content.replace(/    setAssetTransferInput\(""\);\n    setAssetSOQLResult\(""\);\n    setAccountSOQLResult\(""\);\n    setTransferOutput\(""\);\n    setTransferDebug\(""\);\n/g, '');

// 6. Refactor the Grid and JSX
// Replace {isAssetTransfer && ...} left pane block
content = content.replace(/          \{isAssetTransfer && \([\s\S]*?<\/Card>\n          \)\}/, '');

// Replace {isAssetTransfer && ...} right pane block
content = content.replace(/          \{isAssetTransfer && \([\s\S]*?\}\n            <\/Card>\n          \)\}/, '');

// Prepend AssetTransferTool inside the grid
const gridStart = '<div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">';
if (!content.includes('<AssetTransferTool templatePicker')) {
  content = content.replace(
    gridStart,
    `${gridStart}\n        {isAssetTransfer ? <AssetTransferTool templatePicker={templatePickerCard} /> : <>\n`
  );
  
  const wrapperEnd = `      </div>\n    </div>\n  );\n}`;
  content = content.replace(
    wrapperEnd,
    `        </>}\n      </div>\n    </div>\n  );\n}`
  );
}

fs.writeFileSync(file, content);
console.log("Refactor applied!");
