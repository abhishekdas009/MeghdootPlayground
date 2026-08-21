with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_email_1 = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Mail className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Email Template Output</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(EMAIL_TEMPLATE)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>"""

new_email_1 = """                {/* Massive Watermark FOR EMAIL */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    FOR EMAIL
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-10 md:mt-12">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(EMAIL_TEMPLATE)}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Email Template<br />Output
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>"""

old_post_1 = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Post Template Output</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(POST_TEMPLATE)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>"""

new_post_1 = """                {/* Massive Watermark FOR POST */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    FOR POST
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-10 md:mt-12">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(POST_TEMPLATE)}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Post Template<br />Output
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>"""

old_email_2 = """                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                              <Mail className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base font-black tracking-tight text-foreground">Email Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(mailTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>"""

new_email_2 = """                      {/* Massive Watermark FOR EMAIL */}
                      <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                        <span className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                          FOR EMAIL
                        </span>
                      </div>

                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-10 md:mt-12">
                          <div className="flex flex-col gap-1 w-full relative">
                            <div className="absolute top-0 right-0">
                              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(mailTemplateText)}>
                                <Copy className="h-3.5 w-3.5" /> Copy
                              </Button>
                            </div>
                            <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                              Email Template<br />Output
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>"""

old_post_2 = """                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base font-black tracking-tight text-foreground">Post Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(postTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>"""

new_post_2 = """                      {/* Massive Watermark FOR POST */}
                      <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                        <span className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                          FOR POST
                        </span>
                      </div>

                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-10 md:mt-12">
                          <div className="flex flex-col gap-1 w-full relative">
                            <div className="absolute top-0 right-0">
                              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(postTemplateText)}>
                                <Copy className="h-3.5 w-3.5" /> Copy
                              </Button>
                            </div>
                            <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                              Post Template<br />Output
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>"""

count = 0
if old_email_1 in page:
    page = page.replace(old_email_1, new_email_1)
    print("Replaced Standard Email successfully")
    count += 1
if old_post_1 in page:
    page = page.replace(old_post_1, new_post_1)
    print("Replaced Standard Post successfully")
    count += 1
if old_email_2 in page:
    page = page.replace(old_email_2, new_email_2)
    print("Replaced Cancellation Email successfully")
    count += 1
if old_post_2 in page:
    page = page.replace(old_post_2, new_post_2)
    print("Replaced Cancellation Post successfully")
    count += 1

if count > 0:
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(page)
    print(f"Total replaced: {count}")
else:
    print("Could not find any of the old code sections!")
