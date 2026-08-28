import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''              </div>
                      <Download className="h-4 w-4 text-slate-400" /> Download CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>'''

replacement = '''              </div>'''

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up orphaned tags")
