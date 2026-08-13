const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
const sourceFile = project.addSourceFileAtPath('app/soql-generator/page.tsx');

const pageFunc = sourceFile.getFunction('SOQLGeneratorPage');

// Grab the return statement
const returnStmts = pageFunc.getDescendantsOfKind(SyntaxKind.ReturnStatement);
const mainReturn = returnStmts[returnStmts.length - 1];

// Find {isCancellation && (...)}
let cancellationJSX = null;
const jsxExprs = mainReturn.getDescendantsOfKind(SyntaxKind.JsxExpression);
for (const expr of jsxExprs) {
    if (expr.getText().includes('isCancellation &&')) {
        // This is the expression!
        // We want to extract the right side of the && operator.
        const binaryExpr = expr.getFirstDescendantByKind(SyntaxKind.BinaryExpression);
        if (binaryExpr) {
            const right = binaryExpr.getRight();
            cancellationJSX = right.getText();
        }
    }
}

if (!cancellationJSX) {
    console.log("Could not find cancellation JSX!");
    process.exit(1);
}

console.log("Found cancellation JSX, length:", cancellationJSX.length);

// Now, replace the entire return statement with just the cancellation JSX
mainReturn.replaceWithText(`return (\n  <div className="space-y-6 w-full">\n    ${cancellationJSX}\n  </div>\n);`);

// Rename function
pageFunc.rename('TicketCancellationTool');

// Now, we could delete unused statements. Since this is an automated refactor,
// we can let the developer (me) fix the remaining unused things manually or just leave them.
// But we should remove all OTHER `is...` components.
// We've already replaced the entire return statement!

sourceFile.saveSync();
console.log("Saved directly to page.tsx!");

