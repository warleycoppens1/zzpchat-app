'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewQuotePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to quotes page with create view
    router.replace('/dashboard/quotes?view=create')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
}


