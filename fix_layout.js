const fs = require('fs');
let code = fs.readFileSync('frontend/app/soql-generator/page.tsx', 'utf8');

const startMarker = '{isCaseAssign && (';
const endMarker = '{/* Round Robin UI Cards (Only shown after generation) */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log('Markers not found!');
  process.exit(1);
}

const replacement = `{isCaseAssign && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start w-full">
                {/* === COLUMN 1: WORKBENCH === */}
                <div className="space-y-4 flex flex-col">
                  {/* Assignment Mode & Quick Execute Control Box */}
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Assignment Mode & Execution</CardTitle>
                        </div>
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Randomized</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">{caseAssignmentRows.length} valid IDs</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Open status</Badge>
                        <Badge variant={caseOwnerLoadState === 'error' ? 'danger' : 'outline'} className={cn('text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm', caseOwnerLoadState === 'error' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}>
                          {caseOwnerLoadState === 'loading' ? 'Roster syncing' : caseOwnerLoadState === 'error' ? 'Roster offline' : \\\\\\\\ active owners\\\}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4 relative z-10">
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant={caseAssignMode === 'equal' ? 'primary' : 'ghost'} onClick={() => setCaseAssignMode('equal')} className={cn('text-xs h-9 font-bold rounded-lg transition-all', caseAssignMode === 'equal' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:text-purple-600')}>
                              Equally
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white border-slate-700 text-xs font-semibold rounded-xl">Distribute equally to all active owners</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant={caseAssignMode === 'owner-wise' ? 'primary' : 'ghost'} onClick={() => setCaseAssignMode('owner-wise')} className={cn('text-xs h-9 font-bold rounded-lg transition-all', caseAssignMode === 'owner-wise' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:text-purple-600')}>
                              Owner Wise
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white border-slate-700 text-xs font-semibold rounded-xl">Distribute equally only to selected owners</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant={caseAssignMode === 'quantity-wise' ? 'primary' : 'ghost'} onClick={() => setCaseAssignMode('quantity-wise')} className={cn('text-xs h-9 font-bold rounded-lg transition-all', caseAssignMode === 'quantity-wise' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:text-purple-600')}>
                              Qty Wise
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white border-slate-700 text-xs font-semibold rounded-xl">Distribute specific quantities to selected owners</TooltipContent>
                        </Tooltip>
                      </div>

                      {caseAssignMode === 'equal' && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                            Securely shuffles Case IDs, then gives every active owner exactly {caseAssignmentRows.length > 0 && activeCaseOwners.length > 0 ? Math.floor(caseAssignmentRows.length / activeCaseOwners.length) : 0} cases. {caseAssignmentRows.length > 0 && activeCaseOwners.length > 0 ? caseAssignmentRows.length % activeCaseOwners.length : 0} remainder cases are left unassigned.
                          </p>
                        </div>
                      )}`;

                      {caseAssignMode === 'owner-wise' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-3">
                          <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                            Selected owners receive an equal whole-number share after the Case IDs are shuffled. Any remainder stays unassigned.
                          </p>
                          <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                            {activeCaseOwners.map((owner) => {
                              const checked = selectedOwnerIds.includes(owner.ownerId);
                              return (
                                <label key={owner.id} className={cn('flex items-center gap-2.5 rounded-xl border p-2 cursor-pointer transition-all', checked ? 'bg-purple-500/5 border-purple-500/30 shadow-sm' : 'bg-card border-slate-200 dark:border-slate-700 hover:border-purple-500/30')}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        setSelectedOwnerIds((prev) => [...prev, owner.ownerId]);
                                      } else {
                                        setSelectedOwnerIds((prev) => prev.filter((id) => id !== owner.ownerId));
                                      }
                                    }}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500/30"
                                  />
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{owner.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {caseAssignMode === 'quantity-wise' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-3 space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Allocated</span>
                            <span className={cn(quantityOwnerConfigs.reduce((acc, curr) => acc + (curr.selected ? Number(curr.quantity || 0) : 0), 0) > caseAssignmentRows.length ? 'text-rose-500' : 'text-emerald-500')}>
                              {quantityOwnerConfigs.reduce((acc, curr) => acc + (curr.selected ? Number(curr.quantity || 0) : 0), 0)} / {caseAssignmentRows.length}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                            Set any whole-number quantity per owner. IDs are shuffled before assignment; any unallocated IDs remain unassigned.
                          </p>
                          <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                            {quantityOwnerConfigs.map((owner, index) => (
                              <div key={owner.id} className={cn('flex items-center justify-between gap-3 rounded-xl border p-2 transition-all', owner.selected ? 'bg-purple-500/5 border-purple-500/30 shadow-sm' : 'bg-card border-slate-200 dark:border-slate-700')}>
                                <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={owner.selected}
                                    onChange={(event) => {
                                      const checked = event.target.checked;
                                      setQuantityOwnerConfigs((prev) =>
                                        prev.map((item, itemIndex) =>
                                          itemIndex === index ? { ...item, selected: checked } : item
                                        )
                                      );
                                    }}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500/30"
                                  />
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{owner.name}</span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={owner.quantity}
                                  disabled={!owner.selected}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    setQuantityOwnerConfigs((prev) =>
                                      prev.map((item, itemIndex) =>
                                        itemIndex === index ? { ...item, quantity: value } : item
                                      )
                                    );
                                  }}
                                  className="w-16 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-center font-mono font-bold disabled:opacity-40 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 shadow-inner"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Execution Action Bar */}
                      <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-5 flex-1 shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5" onClick={handleRunCaseAssignment}>
                          <CheckCircle2 className="h-4.5 w-4.5" /> Generate Assignment
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput} title="Copy result">
                          <Copy className="h-4 w-4 text-slate-400" /> <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput} title="Download CSV">
                          <Download className="h-4 w-4 text-slate-400" /> <span className="hidden sm:inline">CSV</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* === COLUMN 2: RESULTS === */}
                <div className="space-y-4 flex flex-col">
                  {/* 1. Assignment Output Box */}
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-black tracking-tight text-foreground">Final Assignment Output</CardTitle>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ready for Data Loader</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>
                            <Download className="h-3.5 w-3.5" /> CSV
                          </Button>
                        </div>
                      </div>
                      {caseAssignmentResult && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                            {caseAssignmentResult.assignedCount} assigned
                          </Badge>
                          <Badge className={cn('text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm border', caseAssignmentResult.unassignedCaseIds.length ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700')}>
                            {caseAssignmentResult.unassignedCaseIds.length} unassigned
                          </Badge>
                          {caseAssignMode !== 'quantity-wise' && (
                            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                              {caseAssignmentResult.casesPerOwner} each
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-5 relative z-10">
                      <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                        <pre className="overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 h-[140px] max-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                          {caseAssignOutput || \\\"_", "Id", "Status", "OwnerId"\\\\n"[Case]", "500Ny00001RpOgFIAV", "Open", "005Ny00000QgwYTIAZ"\\\}
                        </pre>
                      </div>
                      {caseAssignmentResult && caseAssignmentResult.unassignedCaseIds.length > 0 && (
                        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-200">
                          <strong className="font-black">{caseAssignmentResult.unassignedCaseIds.length} Case ID{caseAssignmentResult.unassignedCaseIds.length === 1 ? '' : 's'} not included:</strong>{' '}
                          Kept out of this Data Loader file by the current allocation. {caseAssignmentResult.unassignedCaseIds.slice(0, 3).join(', ')}{caseAssignmentResult.unassignedCaseIds.length > 3 ? '�' : ''}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* === COLUMN 3: MASTER ROSTER === */}
                <div className="space-y-4 flex flex-col">
                  {/* Compact High-Density Owner Master Management */}
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col flex-1 transition-all duration-300 relative group">
                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                            <Users className="h-4.5 w-4.5" />
                          </div>
                          <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Master Roster ({caseOwners.length})</CardTitle>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={refreshCaseOwners} disabled={caseOwnerAction !== null} title="Refresh DB">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={handleExportOwners} title="Export JSON">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <label className="inline-flex cursor-pointer group">
                            <input type="file" accept="application/json" className="hidden" onChange={handleImportOwners} disabled={caseOwnerAction !== null} />
                            <span className="flex items-center justify-center h-7 w-7 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-500/10 rounded-lg transition-colors" title="Import JSON">
                              <Upload className="h-3.5 w-3.5" />
                            </span>
                          </label>
                          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={handleResetOwners} disabled={caseOwnerAction !== null} title="Reset default roster">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 relative z-10">
                      {/* Compact Add/Update Bar */}
                      <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
                        <input
                          type="text"
                          placeholder="Employee name..."
                          value={ownerForm.name}
                          onChange={(event) => setOwnerForm((prev) => ({ ...prev, name: event.target.value }))}
                          disabled={caseOwnerAction !== null}
                          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
                        />
                        <input
                          type="text"
                          placeholder="005Ny00000..."
                          value={ownerForm.ownerId}
                          onChange={(event) => setOwnerForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                          disabled={caseOwnerAction !== null}
                          className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
                        />
                        <Button size="sm" className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all" onClick={handleAddOrUpdateOwner} disabled={caseOwnerAction !== null}>
                          {editingOwnerRecordId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                          {editingOwnerRecordId ? 'Save' : 'Add'}
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl transition-all shadow-sm" onClick={clearCaseOwnerForm} disabled={caseOwnerAction !== null} title="Clear inputs">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Scrollable High-Density Roster Panel */}
                      <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                        {caseOwnerLoadState === 'loading' && (
                          <div className="p-8 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                            <RotateCcw className="h-6 w-6 animate-spin mb-3 text-blue-500" />
                            <span className="text-xs font-black uppercase tracking-widest">Syncing roster...</span>
                          </div>
                        )}
                        {caseOwnerLoadState !== 'loading' && caseOwners.length === 0 && (
                          <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                            <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">No employees saved</p>
                          </div>
                        )}
                        {caseOwners.map((owner) => (
                          <div key={owner.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 hover:shadow-md transition-all group backdrop-blur-sm shadow-inner">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shadow-inner', owner.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}>
                                <span className={cn('h-2 w-2 rounded-full', owner.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400')} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-foreground whitespace-nowrap">{owner.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">{owner.ownerId}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={() => handleEditOwner(owner)} title="Edit Employee"><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => handleToggleOwnerStatus(owner.id)} title={owner.isActive ? 'Disable Employee' : 'Enable Employee'}><Power className={cn('h-4 w-4', owner.isActive ? 'text-emerald-500' : 'text-amber-500')} /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={() => handleDeleteOwner(owner.id)} title="Delete Employee"><UserMinus className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
\;

fs.writeFileSync('frontend/app/soql-generator/page.tsx', code.substring(0, startIndex) + replacement + code.substring(endIndex), 'utf8');
