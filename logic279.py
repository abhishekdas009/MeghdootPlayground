with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace "Model Number" label and placeholder in the UI
old_input = """                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                    Model Number
                  </p>
                  <AutocompleteInput
                    icon={Box}
                    options={dbModels}
                    value={modelNumber}
                    onChange={setModelNumber}
                    placeholder="Ex: CNHW12GAFU"
                    required
                  />"""

new_input = """                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                    Model Number(s)
                  </p>
                  <AutocompleteInput
                    icon={Box}
                    options={dbModels}
                    value={modelNumber}
                    onChange={setModelNumber}
                    placeholder="Ex: ModelA, ModelB, ModelC"
                    required
                  />"""

if old_input in content:
    content = content.replace(old_input, new_input)
    print("Updated input field")

# Display matchedModels in the results section
old_result_div = """                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                          Warranty Term
                        </p>
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl md:text-2xl font-bold text-foreground ">
                            {result.termName}
                          </h4>
                          <CopyTermButton text={result.termName} />
                        </div>
                      </div>"""

new_result_div = """                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                          Warranty Term
                        </p>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl md:text-2xl font-bold text-foreground ">
                            {result.termName}
                          </h4>
                          <CopyTermButton text={result.termName} />
                        </div>
                        {result.matchedModels && result.matchedModels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {result.matchedModels.map((m: string, i: number) => (
                              <span key={i} className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>"""

if old_result_div in content:
    content = content.replace(old_result_div, new_result_div)
    print("Updated results section")

with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
