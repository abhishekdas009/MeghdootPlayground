import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('</pre>\n                  </CardContent>', '</pre>\n                    </div>\n                  </CardContent>')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('The rest fixed!')
