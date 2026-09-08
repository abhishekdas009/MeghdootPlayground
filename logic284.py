with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_result = """                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                            Warranty Term
                          </p>{" "}
                          <div className="flex items-center gap-3">
                            {" "}
                            <h4 className="text-xl md:text-2xl font-bold text-foreground ">
                              {" "}
                              {result.termName}{" "}
                            </h4>{" "}
                            <CopyTermButton text={result.termName} />{" "}
                          </div>{" "}
                        </div>{" "}"""

new_result = """                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                            Warranty Term
                          </p>{" "}
                          <div className="flex items-center gap-3 mb-2">
                            {" "}
                            <h4 className="text-xl md:text-2xl font-bold text-foreground ">
                              {" "}
                              {result.termName}{" "}
                            </h4>{" "}
                            <CopyTermButton text={result.termName} />{" "}
                          </div>{" "}
                          {result.matchedModels && result.matchedModels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {result.matchedModels.map((m: string, i: number) => (
                                <span key={i} className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>{" "}"""

if old_result in content:
    content = content.replace(old_result, new_result)
    print("Updated results section")
else:
    print("Could not find results section")

with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
