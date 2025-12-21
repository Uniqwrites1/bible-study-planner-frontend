import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreatePlan from './pages/CreatePlan'
import ReadingPlan from './pages/ReadingPlan'
import BibleReader from './pages/BibleReader'

function App() {
  const { token } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-plan" element={<CreatePlan />} />
        <Route path="reading-plan/:planId" element={<ReadingPlan />} />
        <Route path="bible-reader" element={<BibleReader />} />
      </Route>
    </Routes>
  )
}

export default App
