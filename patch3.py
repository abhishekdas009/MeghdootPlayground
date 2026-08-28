import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

product_jsx = '''
                    {isProductRecordTypeUpdate && (() => {
                      return (
                        <>
                          {/* STEP 2 */}
                          <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                            <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                              <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                                STEP 2
                              </span>
                            </div>
                            <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                              <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                                <div className="flex flex-col gap-1 w-full relative">
                                  <div className="absolute top-0 right-0 flex gap-2">
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                                      {productStoredCount} stored batches
                                    </Badge>
                                  </div>
                                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                                    Paste SOQL<br />Result Batch
                                  </CardTitle>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Each paste is stored and converted to PRODUCT
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                              <Textarea
                                placeholder="Paste batch SOQL result here..."
                                className="flex-1 min-h-[100px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-none"
                                value={productResultInput}
                                onChange={(e) => handleProductResultInputChange(e.target.value)}
                                onPaste={handleProductResultPaste}
                              />
                            </CardContent>
                          </Card>

                          {/* FINAL */}
                          <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                            <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                              <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                                FINAL
                              </span>
                            </div>
                            <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                              <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                                <div className="flex flex-col gap-1 w-full relative">
                                  <div className="absolute top-0 right-0 flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(productOutput)}>
                                      <Copy className="h-3.5 w-3.5" /> Copy All
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => downloadTextFile("product-record-update-" + Date.now() + ".tsv", productOutput, "text/tab-separated-values;charset=utf-8;")}>
                                      <Download className="h-3.5 w-3.5" /> TSV
                                    </Button>
                                  </div>
                                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                                    All Records
                                  </CardTitle>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Copy table when done
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0 relative z-10 flex-1 flex flex-col min-h-0">
                              <div className="px-6 flex gap-2 pb-4">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 uppercase text-[10px] tracking-widest font-bold px-2 py-0.5">
                                  Rows: {Math.max(0, productOutput.split('\\n').length - 2)}
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 uppercase text-[10px] tracking-widest font-bold px-2 py-0.5">
                                  Record Type: PRODUCT
                                </Badge>
                              </div>
                              <div className="flex-1 overflow-auto border-t border-slate-100 dark:border-white/5 relative min-h-0 bg-slate-50/30 dark:bg-black/10">
                                <table className="w-full text-xs text-left whitespace-nowrap">
                                  <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#1a1f2e]/95 backdrop-blur-sm z-10 shadow-sm">
                                    <tr>
                                      <th className="py-3 px-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] w-12 text-center">#</th>
                                      <th className="py-3 px-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">ID</th>
                                      <th className="py-3 px-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">RECORDTYPE</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {productOutput.split('\\n').slice(1).filter(row => row.trim()).map((row, index) => {
                                      const parts = row.split('\\t');
                                      return (
                                        <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                                          <td className="py-2 px-4 text-slate-400 font-mono text-[10px] w-12 text-center group-hover:text-blue-500 transition-colors">
                                            {index + 1}
                                          </td>
                                          <td className="py-2 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                                            <span className="bg-blue-500/10 px-1.5 py-0.5 rounded">{parts[0]?.replace(/"/g, '') || ''}</span>
                                          </td>
                                          <td className="py-2 px-4 font-mono text-amber-600 dark:text-amber-400 font-medium">
                                            {parts[1]?.replace(/"/g, '') || ''}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
'''

content = content.replace('                    {isCancellation && (() => {', product_jsx + '\n                    {isCancellation && (() => {')

content = content.replace('!isChildDetailsToParent && !isCancellation && !isCaseAssign && (', '!isChildDetailsToParent && !isProductRecordTypeUpdate && !isCancellation && !isCaseAssign && (')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched JSX')
