'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'primary' | 'danger' | 'secondary'
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({
  variant = 'danger',
  className,
  children = 'Sign Out',
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({
        callbackUrl: '/auth/signin',
        redirect: true,
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className || ''}`}
    >
      {isLoading ? 'Signing out...' : children}
    </button>
  )
}
