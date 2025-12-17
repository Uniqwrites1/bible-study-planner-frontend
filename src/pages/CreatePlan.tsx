import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const BIBLE_SECTIONS = [
  { id: 'History Books', name: 'History Books', testament: 'Old Testament' },
  { id: 'Psalms', name: 'Psalms', testament: 'Old Testament' },
  { id: 'Wisdom Books', name: 'Wisdom Books', testament: 'Old Testament' },
  { id: 'Prophetic Books', name: 'Prophetic Books', testament: 'Old Testament' },
  { id: 'The Gospels', name: 'The Gospels', testament: 'New Testament' },
  { id: 'Acts & Epistles', name: 'Acts & Epistles', testament: 'New Testament' },
  { id: 'Revelation', name: 'Revelation', testament: 'New Testament' },
]

export default function CreatePlan() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [durationDays, setDurationDays] = useState(365)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [excludedSections, setExcludedSections] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSection = (sectionId: string) => {
    setExcludedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const plan = await apiClient.createReadingPlan({
        name,
        duration_days: durationDays,
        start_date: new Date(startDate).toISOString(),
        excluded_sections: excludedSections,
        bible_version_id: user?.preferred_bible_version || 'de4e12af7f28f599-02',
      })
      
      navigate(`/plan/${plan.id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Reading Plan</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g., Complete Bible in One Year"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              required
              min="1"
              max="3650"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include Bible Sections
          </label>
          <div className="space-y-2">
            {BIBLE_SECTIONS.map((section) => (
              <label key={section.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!excludedSections.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{section.name}</div>
                  <div className="text-sm text-gray-500">{section.testament}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}
