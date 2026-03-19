'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)

  // Reset loading state when pathname or search params change
  useEffect(() => {
    setIsPending(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.href.includes('#') &&
        anchor.target !== '_blank' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
          // Only show loader if the URL is actually different
          const targetUrl = new URL(anchor.href)
          if (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) {
            setIsPending(true)
          }
      }
    }

    const handlePopState = () => {
      setIsPending(true)
    }

    document.addEventListener('click', handleAnchorClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!isPending) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-white border border-zinc-200 shadow-xl rounded-full px-4 py-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-sm animate-pulse" />
      </div>
      <span className="text-[13px] font-semibold text-zinc-700 tracking-tight">
        Loading...
      </span>
    </div>
  )
}
