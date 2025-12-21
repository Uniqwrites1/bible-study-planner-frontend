import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiClient } from '@/lib/api'
import { format } from 'date-fns'
import { CheckCircle, Circle, BookOpen } from 'lucide-react'

export default function ReadingPlan() {
  const { planId } = useParams<{ planId: string }>()
  const queryClient = useQueryClient()

  const { data: plan, isLoading } = useQuery(
    ['reading-plan', planId],
    () => apiClient.getReadingPlan(Number(planId))
  )

  const markCompleteMutation = useMutation(
    (readingId: number) => apiClient.markReadingComplete(Number(planId), readingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reading-plan', planId])
        queryClient.invalidateQueries(['plan-progress', Number(planId)])
      },
    }
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!plan) {
    return <div className="text-center py-12">Plan not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
        <p className="text-gray-500 mt-1">
          {plan.duration_days} days • Started {format(new Date(plan.start_date), 'MMM d, yyyy')}
        </p>
      </div>

      <div className="space-y-4">
        {plan.daily_readings?.map((reading: any) => (
          <div key={reading.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {reading.day_number}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(reading.reading_date), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="space-y-2">
                  {reading.readings.map((r: any, idx: number) => (
                    <Link
                      key={idx}
                      to={`/bible-reader?book=${r.book}&chapterStart=${r.chapter_start}&chapterEnd=${r.chapter_end}&day=${reading.day_number}&planId=${planId}`}
                      className="flex items-center space-x-2 text-sm hover:text-primary-600 transition-colors group"
                    >
                      <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                      <div>
                        <span className="font-medium text-gray-700 group-hover:text-primary-600">{r.book}</span>
                        <span className="text-gray-600 group-hover:text-primary-600">
                          {' '}{r.chapter_start}
                          {r.chapter_end !== r.chapter_start && `-${r.chapter_end}`}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">({r.section})</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <button
                onClick={() => markCompleteMutation.mutate(reading.id)}
                disabled={reading.is_completed || markCompleteMutation.isLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  reading.is_completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {reading.is_completed ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
