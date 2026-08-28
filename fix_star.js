const fs = require("fs");
let content = fs.readFileSync("frontend/app/soql-generator/page.tsx", "utf-8");
const target = "className={`h-4.5 w-4.5 transition-transform hover:scale-110 ${";
const replacement = "className={`h-4.5 w-4.5 transition-all duration-500 ease-out hover:scale-125 hover:-rotate-12 ${";
content = content.replace(target, replacement);
fs.writeFileSync("frontend/app/soql-generator/page.tsx", content);
console.log("Success");
