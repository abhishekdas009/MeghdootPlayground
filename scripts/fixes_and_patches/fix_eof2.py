import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''        </CardContent>
      </Card>
    </div>
  );
}''', '''        </CardContent>
      </Card>
  );
}''')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed extra div")
