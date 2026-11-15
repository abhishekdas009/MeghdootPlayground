with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Update title of Step 4 from "Child to Asset Output" to "CHILD TO ASSET"
content = content.replace('CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Child to Asset Output</CardTitle>', 'CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">CHILD TO ASSET</CardTitle>')

# Update placeholder of Step 4
old_placeholder = 'placeholder="Output will appear here..."'
new_placeholder = 'placeholder={`_\\tId\\tAccountId\\tParentId\\tRecordTypeId\\n[Asset]\\t02iNy00000CKkhCIAT\\t001Ny00001iPnOgIAK\\t\\t012Ny0000003SvrIAE\\n[Asset]\\t02iNy00000CLDskIAH\\t001Ny00000bp44EIAQ\\t\\t012Ny0000003SvrIAE`}'
content = content.replace(old_placeholder, new_placeholder)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success 111")
