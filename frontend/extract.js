const fs = require('fs');

function extractTool(inputFile, outputFile, toolName, startMarker) {
    const code = fs.readFileSync(inputFile, 'utf-8');
    
    // Find the marker
    const startIndex = code.indexOf(startMarker);
    if (startIndex === -1) {
        console.log("Marker not found for " + toolName);
        return;
    }
    
    // The start index points to '{!isCancellation...', we need to find the matching '}'
    let braceCount = 0;
    let endIndex = -1;
    
    for (let i = startIndex; i < code.length; i++) {
        if (code[i] === '{') braceCount++;
        else if (code[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                endIndex = i;
                break;
            }
        }
    }
    
    if (endIndex === -1) {
        console.log("Matching brace not found!");
        return;
    }
    
    const expr = code.substring(startIndex, endIndex + 1);
    
    let innerJSX = expr.replace(startMarker, '');
    innerJSX = innerJSX.trim();
    if (innerJSX.endsWith(')}')) {
        innerJSX = innerJSX.substring(0, innerJSX.length - 2);
    } else if (innerJSX.endsWith('}')) {
        innerJSX = innerJSX.substring(0, innerJSX.length - 1);
    }
    
    const newCode = code.replace(/return \(\s+<div className="workspace-page[\s\S]*?\);\n}/m, `return (\n  <div className="space-y-6 w-full ${toolName.toLowerCase()}-wrapper">\n    ${innerJSX}\n  </div>\n);\n}`);
    const finalCode = newCode.replace('export default function SOQLGeneratorPage', `export function ${toolName}`);
    
    fs.writeFileSync(outputFile, finalCode);
    console.log("Successfully extracted " + toolName);
}

fs.copyFileSync('app/soql-generator/page.tsx', 'components/soql-generator/StandardSOQLGenerator.tsx');

extractTool('app/soql-generator/page.tsx', 'components/soql-generator/StandardSOQLGenerator.tsx', 'StandardSOQLGenerator', '{!isCancellation && !isCaseAssign && !isAssetTransfer && !isChildDetailsToParent && (!activeTemplate || activeTemplate?.type === "soql" || !activeTemplate?.type) && (');
