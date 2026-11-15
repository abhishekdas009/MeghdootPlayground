import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will use regex to remove specific objects from the defaultTemplates array.
# Because the array contains objects, I'll match the start of the object to the end of the object.

to_remove_ids = ["13", "14", "2", "8", "15"]

for tid in to_remove_ids:
    # Match an object in the array that has `id: "{tid}"`
    # It looks like:
    #   {
    #     id: "13",
    #     name: "CANCELLATION TICKETS",
    #     ...
    #   },
    pattern = r'\s*\{\s*id:\s*"' + tid + r'".*?\},'
    content = re.sub(pattern, '', content, flags=re.DOTALL)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success 64")
