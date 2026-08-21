const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Abhishek/.gemini/antigravity/brain/255e5418-af51-4463-98d9-78ad964e889c/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.content && obj.content.includes('<Download className="h-4 w-4 text-slate-400" /> Download CSV') && !obj.content.includes('find_code.js')) {
       console.log(obj.content);
       break;
    }
  } catch (e) {}
}
