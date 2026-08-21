import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad = '''                        </div>
                      ))}
                    </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <BarChart3 className="h-4.5 w-4.5" />'''

good = '''                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <BarChart3 className="h-4.5 w-4.5" />'''

text = text.replace(bad, good)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed 4565!')
