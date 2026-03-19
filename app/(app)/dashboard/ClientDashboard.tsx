'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, Webhook, Play, Search, Folder, CheckCircle2, Files, Filter, CheckSquare, ChevronRight, ChevronDown, Maximize2, Minimize2, Pencil, Settings2 } from 'lucide-react'

export function ClientDashboard({ endpoints, origin }: { endpoints: any[], origin: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const router = useRouter()

  const handleCopy = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this endpoint?')) return;
    setDeleting(id)
    try {
      await fetch(`/api/endpoints/${id}`, { method: 'DELETE' })
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; })
      router.refresh()
    } catch (e) {
      console.error(e)
    }
    setDeleting(null)
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selected.size} endpoints?`)) return;
    try {
      const promises = Array.from(selected).map(id => fetch(`/api/endpoints/${id}`, { method: 'DELETE' }));
      await Promise.all(promises);
      setSelected(new Set());
      router.refresh();
    } catch (e) {
      console.error(e)
    }
  }

  const handleDuplicate = async (ep: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setDuplicating(ep.id)
    try {
      await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${ep.path}-copy`,
          method: ep.method || 'GET',
          [ep.type]: ep.config
        })
      })
      router.refresh()
    } catch (e) {
      console.error(e)
    }
    setDuplicating(null)
  }

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllGroup = (groupEndpoints: any[], e: React.MouseEvent) => {
    e.stopPropagation()
    const groupIds = groupEndpoints.map(e => e.id)
    const allSelected = groupIds.length > 0 && groupIds.every(id => selected.has(id))
    
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        groupIds.forEach(id => next.delete(id))
      } else {
        groupIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  // Filter and group endpoints
  const groupedEndpoints = useMemo(() => {
    let filtered = endpoints.filter(ep => 
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ep.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filterType !== 'all') {
      filtered = filtered.filter(ep => ep.type === filterType)
    }

    const groups: Record<string, any[]> = {}
    filtered.forEach(ep => {
      const groupName = ep.path.split('/')[0] || 'root'
      if (!groups[groupName]) groups[groupName] = []
      groups[groupName].push(ep)
    })

    return groups
  }, [endpoints, searchQuery, filterType])

  const totalEndpoints = endpoints.length;
  const schemaCount = endpoints.filter(ep => ep.type === 'schema').length;

  const expandAll = () => setCollapsedGroups(new Set());
  const collapseAll = () => setCollapsedGroups(new Set(Object.keys(groupedEndpoints)));

  return (
    <div className="space-y-8 pb-24">
      {/* Dashboard Toolbar (Simple) */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
        
        {/* Left: Simple text stats */}
        <div className="flex items-center gap-3 text-[13px] font-medium text-zinc-500">
          <div>
            Total Endpoints: <span className="text-zinc-900 font-semibold ml-1">{totalEndpoints}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
          <div>
            Schemas: <span className="text-zinc-900 font-semibold ml-1">{schemaCount}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-300 mx-2"></div>
          <div className="flex items-center gap-1.5 bg-white border border-zinc-200/80 p-0.5 rounded-lg shadow-sm">
             <button onClick={expandAll} className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors tooltip-trigger relative group" title="Expand All">
               <Maximize2 className="w-3.5 h-3.5" />
             </button>
             <button onClick={collapseAll} className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors tooltip-trigger relative group" title="Collapse All">
               <Minimize2 className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        {/* Right: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search endpoints..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 bg-white border border-zinc-200 hover:border-zinc-300 rounded-md text-[13px] font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm"
            />
          </div>

          {/* Minimal Filter */}
          <div className="flex bg-zinc-100 p-0.5 rounded-md w-full sm:w-auto border border-zinc-200/50">
            <button 
              onClick={() => setFilterType('all')} 
              className={`flex-1 sm:flex-none px-4 h-8 text-[12px] font-medium rounded transition-all ${filterType === 'all' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-500 hover:text-zinc-900 border border-transparent'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('schema')} 
              className={`flex-1 sm:flex-none px-4 h-8 text-[12px] font-medium rounded transition-all ${filterType === 'schema' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-500 hover:text-zinc-900 border border-transparent'}`}
            >
              Schema
            </button>
            <button 
              onClick={() => setFilterType('template')} 
              className={`flex-1 sm:flex-none px-4 h-8 text-[12px] font-medium rounded transition-all ${filterType === 'template' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-500 hover:text-zinc-900 border border-transparent'}`}
            >
              Template
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Endpoints Grid */}
      {Object.entries(groupedEndpoints).length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm font-medium bg-white rounded-xl border border-zinc-200 border-dashed">
            <Filter className="w-8 h-8 text-zinc-300 mb-3" />
            No endpoints matched your criteria.
         </div>
      ) : (
        Object.entries(groupedEndpoints).map(([groupName, eps]) => {
          const groupIds = eps.map(e => e.id)
          const isAllGroupSelected = groupIds.length > 0 && groupIds.every(id => selected.has(id))
          const isCollapsed = collapsedGroups.has(groupName)

          return (
            <div key={groupName} className="mb-10 last:mb-0">
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer group select-none"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="flex items-center gap-2">
                  <div className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  <h2 className="text-[15px] font-bold text-zinc-900 tracking-tight capitalize">{groupName}</h2>
                  <span className="text-[11px] font-bold text-zinc-500 bg-zinc-200/50 px-1.5 py-0.5 rounded ml-1">{eps.length}</span>
                </div>
                
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => toggleSelectAllGroup(eps, e)}
                    className="text-[11px] font-bold text-zinc-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 hover:bg-indigo-50/50 px-2 py-1 rounded"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {isAllGroupSelected ? 'Deselect Group' : 'Select Group'}
                  </button>
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {eps.map((ep) => {
                      const fullUrl = `${origin}/api/mock/${ep.namespace}/${ep.path}`
                      const isSchema = ep.type === 'schema'
                      const isSelected = selected.has(ep.id)
                      
                      return (
                        <div 
                          key={ep.id} 
                          className={`group bg-white border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'} rounded-2xl transition-all duration-200 cursor-pointer flex flex-col relative overflow-hidden h-[164px]`}
                          onClick={(e) => toggleSelect(ep.id, e)}
                        >
                          {/* Selection Checkbox (Top Right) */}
                          <div className="absolute top-4 right-4 z-20">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-300 text-transparent'}`}>
                               <CheckCircle2 className="w-3 h-3 stroke-[3px]" />
                            </div>
                          </div>

                          {/* Main Card Content */}
                          <div className="p-5 flex-1 flex flex-col pt-4">
                             <div className="flex items-center gap-2.5 mb-2 pr-8">
                               <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-widest
                                 ${(ep.method || 'GET') === 'GET' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                   (ep.method === 'POST' ? 'bg-sky-50 text-sky-700 border-sky-200' : 
                                   (ep.method === 'PUT' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                   (ep.method === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' : 
                                   (ep.method === 'PATCH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                   'bg-zinc-100 text-zinc-600 border-zinc-200'))))}`}
                               >
                                 {ep.method || 'GET'}
                               </span>
                               <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md border ${isSchema ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
                                 {ep.type}
                               </span>
                             </div>

                             <h3 className="text-[14px] font-bold text-zinc-900 tracking-tight truncate mb-1.5">
                               /{ep.path}
                             </h3>
                             <p className="text-[11px] font-mono text-zinc-500 truncate w-full" title={fullUrl}>
                               {fullUrl.replace(/^https?:\/\//, '')}
                             </p>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="bg-zinc-50/80 border-t border-zinc-100 px-4 py-3 flex items-center justify-between">
                              <Link onClick={(e) => e.stopPropagation()} href={`/endpoints/${ep.id}`} className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 hover:text-indigo-600 transition-colors bg-white hover:bg-zinc-50 border border-zinc-200/80 px-2.5 py-1.5 rounded-lg shadow-sm">
                                <Play className="w-3.5 h-3.5" /> Preview
                              </Link>
                              
                              <div className="flex items-center gap-1">
                                <div className="group/btn relative">
                                  <Link onClick={(e) => e.stopPropagation()} href={`/endpoints/${ep.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200/80 hover:shadow-sm transition-all">
                                    <Settings2 className="w-3.5 h-3.5" />
                                  </Link>
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">Edit</span>
                                </div>
                                <div className="group/btn relative">
                                  <button onClick={(e) => handleCopy(fullUrl, ep.id, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200/80 hover:shadow-sm transition-all" title="Copy URL">
                                    {copied === ep.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">Copy</span>
                                </div>

                                <div className="group/btn relative">
                                  <button disabled={duplicating === ep.id} onClick={(e) => handleDuplicate(ep, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-zinc-200/80 hover:shadow-sm transition-all disabled:opacity-50" title="Duplicate">
                                    {duplicating === ep.id ? <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div> : <Files className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">Duplicate</span>
                                </div>

                                <div className="group/btn relative">
                                  <button disabled={deleting === ep.id} onClick={(e) => handleDelete(ep.id, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-zinc-200/80 hover:shadow-sm transition-all disabled:opacity-50" title="Delete">
                                    {deleting === ep.id ? <div className="w-3.5 h-3.5 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div> : <Trash2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">Delete</span>
                                </div>
                              </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Floating Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-semibold">{selected.size} endpoints selected</span>
          <div className="w-px h-6 bg-zinc-700"></div>
          <button 
            onClick={handleBulkDelete}
            className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete All
          </button>
          <button 
            onClick={() => setSelected(new Set())}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
