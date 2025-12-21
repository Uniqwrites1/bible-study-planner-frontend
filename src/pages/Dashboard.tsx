import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { apiClient } from '@/lib/api'
import { PlusCircle, BookOpen, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data: plans, isLoading } = useQuery('reading-plans', () => 
    apiClient.getReadingPlans(true)
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Reading Plans</h1>
        <Link to="/create-plan" className="btn btn-primary flex items-center space-x-2">
          <PlusCircle className="h-5 w-5" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="text-center py-12 card">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reading plans yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first Bible reading plan</p>
          <Link to="/create-plan" className="mt-6 inline-block btn btn-primary">
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: any) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan }: { plan: any }) {
  const { data: progress } = useQuery(
    ['plan-progress', plan.id],
    () => apiClient.getPlanProgress(plan.id)
  )

  return (
    <Link to={`/reading-plan/${plan.id}`} className="card hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-500">
            Started {format(new Date(plan.start_date), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{plan.duration_days} days</span>
          </div>
          {progress && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{progress.completed_readings}/{progress.total_readings}</span>
            </div>
          )}
        </div>

        {progress && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
