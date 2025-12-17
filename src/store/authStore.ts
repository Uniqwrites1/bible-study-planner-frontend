import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  full_name?: string
  preferred_bible_version: string
  preferred_language: string
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user })
      },
      clearAuth: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
