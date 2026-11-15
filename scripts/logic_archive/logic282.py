with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_input = """              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                Model Number
              </p>{" "}
              <AutocompleteInput
                icon={Box}
                options={dbModels}
                value={modelNumber}
                onChange={setModelNumber}
                placeholder="Ex: CNHW12GAFU"
                required
              />{" "}"""

new_input = """              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                Model Number(s)
              </p>{" "}
              <AutocompleteInput
                icon={Box}
                options={dbModels}
                value={modelNumber}
                onChange={setModelNumber}
                placeholder="Ex: ModelA, ModelB"
                required
              />{" "}"""

if old_input in content:
    content = content.replace(old_input, new_input)
    print("Updated input field")
else:
    print("Could not find input field")

with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
