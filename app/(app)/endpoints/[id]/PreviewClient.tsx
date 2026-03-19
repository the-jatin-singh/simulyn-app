'use client'

import { useState } from 'react'
import { Play, Settings2, CodeSquare, Clock, Globe, Network, TerminalSquare, AlertTriangle, Zap, Files, Save, CheckCircle2, ChevronDown, Pencil } from 'lucide-react'
import Link from 'next/link'
import Editor from '@monaco-editor/react'

export function PreviewClient({ endpoint, fullUrl }: { endpoint: any, fullUrl: string }) {
  const [activeTab, setActiveTab] = useState<'params' | 'payload' | 'structure'>('params')
  
  // Simulation Params
  const [count, setCount] = useState('1')
  const [seed, setSeed] = useState('')
  const [delay, setDelay] = useState('0')
  const [errorSim, setErrorSim] = useState('')
  
  // Runtime State
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)
  
  // Payload & Method
  const [overrideMethod, setOverrideMethod] = useState(endpoint.method === 'ALL' ? 'GET' : (endpoint.method || 'GET'))
  const [payload, setPayload] = useState('{\n  \n}')
  
  // Structure Update
  const [structure, setStructure] = useState(() => JSON.stringify(endpoint.config, null, 2))
  const [savingStructure, setSavingStructure] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResponse(null)
    setStatus(null)
    setTime(null)

    try {
      const url = new URL(fullUrl)
      if (count && count !== '1') url.searchParams.append('count', count)
      if (seed) url.searchParams.append('seed', seed)
      if (delay && delay !== '0') url.searchParams.append('delay', delay)
      if (errorSim) url.searchParams.append('error', errorSim)

      const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(overrideMethod)
      let requestBody = undefined
      let headers: HeadersInit = {}

      if (isBodyMethod && payload.trim()) {
        try {
          // validate it's json
          JSON.parse(payload)
          requestBody = payload
          headers['Content-Type'] = 'application/json'
        } catch(e) {
          // If not valid JSON, we still try to send it as text maybe, but mock API expects JSON 
          // Actually, let fetch throw or server handle it to accurately simulate bad requests
          requestBody = payload
          headers['Content-Type'] = 'application/json'
        }
      }

      const start = Date.now()
      const res = await fetch(url.toString(), {
        method: overrideMethod,
        headers,
        body: requestBody
      })
      const end = Date.now()
      
      const text = await res.text()
      let data;
      try {
        data = JSON.parse(text)
      } catch(e) {
        data = text
      }
      
      setStatus(res.status)
      setTime(end - start)
      setResponse(data)
    } catch (err: any) {
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStructure = async () => {
    try {
      const parsedConfig = JSON.parse(structure)
      setSavingStructure(true)
      const res = await fetch(`/api/endpoints/${endpoint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: parsedConfig })
      })
      
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        const err = await res.json()
        alert(`Error: ${err.error}`)
      }
    } catch(e) {
      alert("Invalid JSON format in Response Structure.")
    } finally {
      setSavingStructure(false)
    }
  }

  const getStatusColor = (code: number | null) => {
    if (!code) return 'bg-zinc-800 text-zinc-400'
    if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    return 'bg-red-500/10 text-red-400 border border-red-500/20'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 pb-6 animate-in fade-in duration-500">
      {/* Request Configuration Panel */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden flex flex-col h-full relative">
          
          {/* Header */}
          <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-500" /> Config
            </h2>
            <div className="flex items-center gap-2">
               {endpoint.method === 'ALL' ? (
                 <div className="relative">
                   <select 
                     value={overrideMethod}
                     onChange={(e) => setOverrideMethod(e.target.value)}
                     className="appearance-none bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 pr-6 rounded-md border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                   >
                     <option value="GET">GET</option>
                     <option value="POST">POST</option>
                     <option value="PUT">PUT</option>
                     <option value="PATCH">PATCH</option>
                     <option value="DELETE">DELETE</option>
                   </select>
                   <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500 pointer-events-none" />
                 </div>
               ) : (
                 <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">
                   {overrideMethod}
                 </span>
               )}
               <Link href={`/endpoints/${endpoint.id}/edit`} className="ml-1 p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Endpoint Configuration">
                 <Settings2 className="w-3.5 h-3.5" />
               </Link>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-zinc-100">
            <button 
              onClick={() => setActiveTab('params')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'params' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
            >
              Params
            </button>
            <button 
              onClick={() => setActiveTab('payload')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'payload' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
            >
              Payload
            </button>
            <button 
              onClick={() => setActiveTab('structure')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'structure' ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
            >
              Structure
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 flex flex-col bg-white min-h-[400px] overflow-hidden">
            
            {activeTab === 'params' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 animate-in fade-in duration-300">
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-2">
                    <Files className="w-3.5 h-3.5 text-zinc-400" /> Generate Count
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="1000" 
                    value={count} 
                    onChange={e => setCount(e.target.value)} 
                    className="w-full h-10 bg-white border border-zinc-200 rounded-lg px-3 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" 
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">Items array length (if schema).</p>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-2">
                    <Network className="w-3.5 h-3.5 text-zinc-400" /> Latency Simulation
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0" 
                      value={delay} 
                      onChange={e => setDelay(e.target.value)} 
                      placeholder="0" 
                      className="w-full h-10 bg-white border border-zinc-200 rounded-lg pl-3 pr-10 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">ms</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-2">
                    <Zap className="w-3.5 h-3.5 text-zinc-400" /> Random Seed
                  </label>
                  <input 
                    type="number" 
                    value={seed} 
                    onChange={e => setSeed(e.target.value)} 
                    placeholder="e.g. 12345" 
                    className="w-full h-10 bg-white border border-zinc-200 rounded-lg px-3 text-[13px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> Force Status Code
                  </label>
                  <select 
                    value={errorSim} 
                    onChange={e => setErrorSim(e.target.value)} 
                    className="w-full h-10 bg-white border border-zinc-200 rounded-lg px-3 text-[13px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm appearance-none"
                  >
                    <option value="">None (200 OK)</option>
                    <option value="400">400 Bad Request</option>
                    <option value="401">401 Unauthorized</option>
                    <option value="403">403 Forbidden</option>
                    <option value="404">404 Not Found</option>
                    <option value="500">500 Internal Error</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'payload' && (
              <div className="flex-1 flex flex-col p-5 animate-in fade-in duration-300">
                <div className="mb-4 shrink-0 flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-zinc-900 mb-1">Request Body Sandbox</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed pr-4">
                      Provide a custom JSON payload. Simulyn will automatically attach this to your fetch request for <span className="font-mono font-semibold text-zinc-700">POST</span>, <span className="font-mono font-semibold text-zinc-700">PUT</span>, and <span className="font-mono font-semibold text-zinc-700">PATCH</span> methods.
                    </p>
                  </div>
                  {endpoint.request_schema && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 whitespace-nowrap" title="Schema Required">Strict Validation</span>
                  )}
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-zinc-800 bg-[#121212] shadow-sm mt-1">
                   <div className="absolute inset-0">
                     <Editor
                       height="100%"
                       defaultLanguage="json"
                       theme="vs-dark"
                       value={payload}
                       onChange={(value) => setPayload(value || '')}
                       options={{
                         minimap: { enabled: false },
                         fontSize: 12,
                         lineHeight: 20,
                         padding: { top: 12 },
                         scrollBeyondLastLine: false,
                         formatOnPaste: true,
                         tabSize: 2
                       }}
                     />
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="flex-1 flex flex-col p-5 animate-in fade-in duration-300">
                <div className="flex items-start justify-between mb-4 shrink-0">
                   <div>
                     <h3 className="text-[13px] font-bold text-zinc-900 mb-1">Live Schema Override</h3>
                     <p className="text-[11px] text-zinc-500 leading-relaxed pr-2">
                       Instantly edit this endpoint's underlying <span className="font-mono font-semibold text-zinc-700">{endpoint.type}</span> rules. Hit save to update the mock engine without leaving.
                     </p>
                   </div>
                   <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5" title="Instantly syncs to database">Live Sync</span>
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-zinc-800 bg-[#121212] shadow-sm mt-1">
                   <div className="absolute inset-0">
                     <Editor
                       height="100%"
                       defaultLanguage="json"
                       theme="vs-dark"
                       value={structure}
                       onChange={(value) => setStructure(value || '')}
                       options={{
                         minimap: { enabled: false },
                         fontSize: 12,
                         lineHeight: 20,
                         padding: { top: 12 },
                         scrollBeyondLastLine: false,
                         formatOnPaste: true,
                         tabSize: 2
                       }}
                     />
                   </div>
                </div>
                <div className="mt-4 flex justify-end shrink-0">
                   <button 
                     onClick={handleSaveStructure}
                     disabled={savingStructure}
                     className={`h-9 px-4 rounded-lg text-[12px] font-bold flex items-center gap-2 transition-all shadow-sm ${saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50'}`}
                   >
                     {savingStructure ? <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></div> : (saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
                     {savingStructure ? 'Saving...' : (saveSuccess ? 'Saved' : 'Save Structure')}
                   </button>
                </div>
              </div>
            )}
            
          </div>
          
          {/* Fixed Bottom Send Action */}
          <div className="p-5 bg-zinc-50/80 border-t border-zinc-100 mt-auto z-10 shrink-0">
            <button 
              onClick={handleTest} 
              disabled={loading} 
              className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl text-[14px] font-bold hover:bg-indigo-700 disabled:opacity-80 transition-all shadow-md hover:shadow-indigo-500/25 focus:outline-none relative overflow-hidden group"
            >
              {loading && <div className="absolute inset-0 bg-white/20 blur-xl animate-pulse"></div>}
              {loading ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Sending...
                 </>
              ) : (
                 <>
                   <Play className="w-4 h-4 fill-white" /> Send Request
                 </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Response Inspector Panel */}
      <div className="flex-1 bg-[#121212] rounded-2xl shadow-2xl border border-zinc-800 flex flex-col min-h-[500px] overflow-hidden relative">
        <div className="bg-[#1A1A1A] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/50 gap-3 relative z-20">
          <div className="flex items-center gap-3">
            <TerminalSquare className="w-4 h-4 text-indigo-400" />
            <div className="flex items-center rounded-md bg-[#252525] p-1 border border-zinc-700/50 relative group cursor-pointer max-w-full overflow-hidden">
               <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider mr-2 shrink-0
                  ${(overrideMethod) === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 
                    (overrideMethod === 'POST' ? 'bg-sky-500/20 text-sky-400' : 
                    (overrideMethod === 'PUT' ? 'bg-orange-500/20 text-orange-400' : 
                    (overrideMethod === 'DELETE' ? 'bg-red-500/20 text-red-400' : 
                    (overrideMethod === 'PATCH' ? 'bg-amber-500/20 text-amber-400' : 
                    'bg-zinc-700 text-zinc-300'))))}`}
               >
                 {overrideMethod}
               </span>
               <span className="text-[12px] font-mono text-zinc-300 truncate w-[200px] sm:w-[350px]">{fullUrl}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
             {status && (
                <div className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-sm ${getStatusColor(status)}`}>
                   <Globe className="w-3 h-3" /> {status} {status === 200 ? 'OK' : (status === 201 ? 'CREATED' : '')}
                </div>
             )}
             {time !== null && (
                <div className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 shadow-sm">
                   <Clock className="w-3 h-3 text-zinc-400" /> {time} <span className="text-zinc-500">ms</span>
                </div>
             )}
          </div>
        </div>
        
        <div className="flex-1 relative overflow-hidden bg-[#1D1D1D]">
          {loading && (
             <div className="absolute inset-0 bg-[#1D1D1D]/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="flex gap-2 items-center mb-4">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-[11px] font-bold text-indigo-400 tracking-widest uppercase shadow-indigo-500/50 drop-shadow-md">Awaiting JSON...</span>
             </div>
          )}
          
          {response ? (
            <div className="absolute inset-0">
               <Editor
                 height="100%"
                 defaultLanguage="json"
                 theme="vs-dark"
                 value={typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                 options={{
                   readOnly: true,
                   minimap: { enabled: false },
                   fontSize: 13,
                   lineHeight: 22,
                   padding: { top: 20, bottom: 20 },
                   scrollBeyondLastLine: false,
                   smoothScrolling: true,
                   wordWrap: "on",
                   cursorBlinking: "solid"
                 }}
               />
            </div>
          ) : (
            <div className="text-zinc-500 h-full flex flex-col items-center justify-center select-none bg-[#121212]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center mb-5 rotate-3 shadow-xl">
                   <CodeSquare className="w-6 h-6 text-zinc-600" />
                </div>
                <p className="text-[14px] font-medium text-zinc-400 mb-1">Response Inspector is Empty</p>
                <p className="text-[12px] text-zinc-600">Configure parameters on the left and hit <span className="text-zinc-400 font-bold">Send Request</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
