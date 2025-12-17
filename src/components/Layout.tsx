import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, Home, PlusCircle, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-xl text-gray-900">Bible Study Planner</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/create-plan"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>New Plan</span>
                </Link>
                <Link
                  to="/read"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Bible</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
