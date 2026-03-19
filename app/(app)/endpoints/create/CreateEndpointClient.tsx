'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Editor from '@monaco-editor/react'
import { Database, LayoutTemplate, Terminal, Code2, AlertCircle, HelpCircle } from 'lucide-react'

export function CreateEndpointClient({ namespace }: { namespace: string }) {
  const [path, setPath] = useState('')
  const [method, setMethod] = useState('GET')
  const [type, setType] = useState<'template'|'schema'>('template')
  const [configStr, setConfigStr] = useState('{\n  "id": "uuid",\n  "name": "name",\n  "email": "email"\n}')
  const [activeEditor, setActiveEditor] = useState<'response' | 'request'>('response')
  const [enableValidation, setEnableValidation] = useState(false)
  const [requestSchemaStr, setRequestSchemaStr] = useState('{\n  "type": "object",\n  "properties": {\n    "username": { "type": "string" },\n    "age": { "type": "integer" }\n  },\n  "required": ["username"]\n}')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let parsedConfig
      try {
        parsedConfig = JSON.parse(configStr)
      } catch (err) {
        throw new Error('Invalid JSON format in Response Definition')
      }

      let parsedRequestSchema = null
      if (enableValidation) {
        try {
          parsedRequestSchema = JSON.parse(requestSchemaStr)
        } catch(err) {
          throw new Error('Invalid JSON format in Request Validation Schema')
        }
      }

      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          method,
          [type]: parsedConfig,
          request_schema: parsedRequestSchema
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create endpoint')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const loadExample = (exampleType: 'auth' | 'users' | 'posts') => {
    setType(exampleType === 'posts' ? 'schema' : 'template')
    if (exampleType === 'auth') {
      setConfigStr('{\n  "token": "string.uuid",\n  "user": {\n    "id": "string.uuid",\n    "email": "internet.email",\n    "name": "person.fullName",\n    "avatar": "image.avatar",\n    "role": "helpers.arrayElement(\'admin\',\'user\')"\n  }\n}')
    } else if (exampleType === 'users') {
      setConfigStr('{\n  "id": "string.uuid",\n  "username": "internet.userName",\n  "location": "location.city",\n  "balance": "finance.amount",\n  "joinedAt": "date.past"\n}')
    } else if (exampleType === 'posts') {
      setConfigStr('{\n  "type": "object",\n  "properties": {\n    "id": { "type": "string", "format": "uuid" },\n    "title": { "type": "string" },\n    "content": { "type": "string" },\n    "views": { "type": "integer", "minimum": 0, "maximum": 5000 }\n  },\n  "required": ["id", "title", "content", "views"]\n}')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-[13px] font-medium text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Routing</h2>
            <p className="text-sm text-zinc-500 mb-4">Define where your endpoint lives.</p>
            
            {/* Endpoint Path & Method Row */}
            <div>
              <label className="block text-[13px] font-semibold text-zinc-900 mb-2">Endpoint Configuration</label>
              <div className="flex gap-3">
                <div className="w-1/4 min-w-[100px]">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full h-10 bg-white border border-zinc-200 rounded-lg px-3 text-[13px] font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm appearance-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                    <option value="ALL">ALL</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">/</span>
                  <input
                    type="text"
                    placeholder="api/v1/users"
                    value={path}
                    required
                    onChange={(e) => setPath(e.target.value.replace(/^\/+/, ''))}
                    className="w-full pl-7 pr-4 h-10 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2 font-medium">This will be available at <span className="text-zinc-700 font-mono">/api/mock/{namespace}/{path || '...'}</span></p>
            </div>
          </div>

          <div className="h-px bg-zinc-200 w-full"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Data Engine</h2>
                <p className="text-sm text-zinc-500 mt-1">Select how dummy data is compiled.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all ${type === 'template' ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                <div className="flex h-6 items-center">
                  <input type="radio" value="template" checked={type === 'template'} onChange={() => {
                    setType('template')
                    setConfigStr('{\n  "id": "string.uuid",\n  "name": "person.fullName",\n  "email": "internet.email",\n  "avatar": "image.avatar"\n}')
                  }} className="h-4 w-4 rounded-full border-zinc-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0" />
                </div>
                <div className="ml-3">
                  <span className={`text-sm font-semibold flex items-center gap-1.5 ${type === 'template' ? 'text-indigo-900' : 'text-zinc-900'}`}>
                    <LayoutTemplate className="w-4 h-4" /> Simple Template
                  </span>
                  <span className="block text-xs text-zinc-500 mt-1 leading-relaxed">Map raw keys to Faker generators. Quickest setup for shallow arrays and objects.</span>
                </div>
              </label>

              <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all ${type === 'schema' ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                <div className="flex h-6 items-center">
                  <input type="radio" value="schema" checked={type === 'schema'} onChange={() => {
                    setType('schema')
                    setConfigStr('{\n  "type": "object",\n  "properties": {\n    "id": { "type": "string", "format": "uuid" },\n    "age": { "type": "integer", "minimum": 18 },\n    "status": { "type": "string", "enum": ["active", "pending"] }\n  },\n  "required": ["id", "age", "status"]\n}')
                  }} className="h-4 w-4 rounded-full border-zinc-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0" />
                </div>
                <div className="ml-3">
                  <span className={`text-sm font-semibold flex items-center gap-1.5 ${type === 'schema' ? 'text-indigo-900' : 'text-zinc-900'}`}>
                    <Database className="w-4 h-4" /> JSON Schema
                  </span>
                  <span className="block text-xs text-zinc-500 mt-1 leading-relaxed">Advanced data generation using powerful native JSON Schema validation rules.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-[500px]">
           <div className="flex items-center justify-between mb-0 border-b border-zinc-200">
             <div className="flex">
                <button type="button" onClick={() => setActiveEditor('response')} className={`px-4 py-3 text-[13px] font-bold tracking-wide uppercase transition-colors border-b-2 ${activeEditor === 'response' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}>
                   Response Data
                </button>
                <button type="button" onClick={() => setActiveEditor('request')} className={`px-4 py-3 text-[13px] font-bold tracking-wide uppercase transition-colors border-b-2 ${activeEditor === 'request' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}>
                   Request Validation
                </button>
             </div>
             
             <div className="flex items-center gap-3 pr-4">
               {activeEditor === 'response' && (
                 <>
                   <div className="group relative">
                     <button type="button" className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 flex items-center gap-1">
                       <HelpCircle className="w-3.5 h-3.5" /> Cheatsheet
                     </button>
                     <div className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-zinc-200 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 p-4">
                        <h4 className="font-bold text-zinc-900 mb-2 border-b border-zinc-100 pb-2">Popular Faker Generators</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono text-zinc-600">
                          <div><span className="text-indigo-600">string.abc</span> - random string</div>
                          <div><span className="text-indigo-600">string.uuid</span> - secure uuid</div>
                          <div><span className="text-indigo-600">person.fullName</span> - John Doe</div>
                          <div><span className="text-indigo-600">internet.email</span> - a@b.com</div>
                          <div><span className="text-indigo-600">internet.password</span> - strong pswd</div>
                          <div><span className="text-indigo-600">image.avatar</span> - avatar url</div>
                          <div><span className="text-indigo-600">finance.amount</span> - 123.45</div>
                          <div><span className="text-indigo-600">location.city</span> - New York</div>
                          <div><span className="text-indigo-600">date.past</span> - 2023-01-01</div>
                          <div><span className="text-indigo-600">company.name</span> - Acme Corp</div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-3 italic font-sans">For JSON Schemas, you can use "format": "email", "minimum": 1, "enum": ["a", "b"]</p>
                     </div>
                   </div>
                   
                   <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Examples:</span>
                      <button type="button" onClick={() => loadExample('users')} className="text-[10px] font-bold text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 transition-colors">USERS</button>
                      <button type="button" onClick={() => loadExample('auth')} className="text-[10px] font-bold text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 transition-colors">AUTH</button>
                      <button type="button" onClick={() => loadExample('posts')} className="text-[10px] font-bold text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 transition-colors">POSTS</button>
                   </div>
                 </>
               )}
               {activeEditor === 'request' && (
                 <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Enforce Schema</span>
                    <input 
                      type="checkbox" 
                      checked={enableValidation}
                      onChange={(e) => setEnableValidation(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-zinc-300 focus:ring-indigo-600"
                    />
                 </label>
               )}
             </div>
           </div>
          <div className="relative rounded-xl rounded-tl-none shadow-sm border border-zinc-200 bg-white flex-1 flex flex-col overflow-hidden">
            {activeEditor === 'response' ? (
              <>
                <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Code2 className="w-4 h-4 text-zinc-500" />
                     <span className="text-[12px] font-mono font-semibold text-zinc-700 select-none">response_{type}.json</span>
                   </div>
                </div>
                <div className="flex-1 relative">
                   <div className="absolute inset-0">
                     <Editor
                       height="100%"
                       defaultLanguage="json"
                       theme="light"
                       value={configStr}
                       onChange={(value) => setConfigStr(value || '')}
                       options={{
                         minimap: { enabled: false },
                         fontSize: 13,
                         lineHeight: 22,
                         padding: { top: 16, bottom: 16 },
                         scrollBeyondLastLine: false,
                         smoothScrolling: true,
                         cursorBlinking: "smooth",
                         formatOnPaste: true,
                         wordWrap: "on"
                       }}
                     />
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Code2 className="w-4 h-4 text-zinc-500" />
                     <span className="text-[12px] font-mono font-semibold text-zinc-700 select-none">request_validation_schema.json</span>
                   </div>
                   {!enableValidation && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Validation Disabled</span>
                   )}
                </div>
                <div className="flex-1 relative">
                   {/* Overlay if disabled */}
                   {!enableValidation && (
                     <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-zinc-400 mb-3" />
                        <h3 className="font-bold text-zinc-800 text-sm mb-1">Validation is Disabled</h3>
                        <p className="text-xs text-zinc-500 max-w-xs mb-4">Toggle "Enforce Schema" in the header to activate payload validation for this endpoint.</p>
                        <button type="button" onClick={() => setEnableValidation(true)} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-zinc-800 transition-colors">Enable Validation</button>
                     </div>
                   )}
                   <div className={`absolute inset-0 ${!enableValidation ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                     <Editor
                       height="100%"
                       defaultLanguage="json"
                       theme="light"
                       value={requestSchemaStr}
                       onChange={(value) => setRequestSchemaStr(value || '')}
                       options={{
                         minimap: { enabled: false },
                         fontSize: 13,
                         lineHeight: 22,
                         padding: { top: 16, bottom: 16 },
                         scrollBeyondLastLine: false,
                         smoothScrolling: true,
                         cursorBlinking: "smooth",
                         formatOnPaste: true,
                         wordWrap: "on"
                       }}
                     />
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-200 gap-4">
        <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Cancel</Link>
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 min-w-[140px] bg-zinc-900 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 disabled:opacity-80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2">
          {loading ? (
             <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deploying...
             </>
          ) : 'Deploy Endpoint'}
        </button>
      </div>
    </form>
  )
}
