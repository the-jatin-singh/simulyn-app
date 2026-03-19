'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, pendingText }: { children: React.ReactNode, pendingText?: string }) {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2.5 text-[14px] font-semibold hover:bg-zinc-800 disabled:opacity-80 transition-all shadow-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-zinc-900 h-10"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {pendingText || children}
        </>
      ) : children}
    </button>
  )
}
