import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, StickyNote, Trash2, X } from 'lucide-react'

// Map Bible book names to their API IDs
const BOOK_ID_MAP: Record<string, string> = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
  'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
  'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
  'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
  'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
  'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
  '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
}

interface Note {
  id: number
  verse_id?: string
  chapter?: number
  content: string
}

export default function BibleReader() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  const book = searchParams.get('book') || ''
  const chapterStart = parseInt(searchParams.get('chapterStart') || '1')
  const chapterEnd = parseInt(searchParams.get('chapterEnd') || chapterStart.toString())
  const day = searchParams.get('day')
  const planId = searchParams.get('planId')
  
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  
  const bibleVersion = user?.preferred_bible_version || 'de4e12af7f28f599-02' // KJV default
  const bookId = BOOK_ID_MAP[book]
  
  // Build passage ID for API (e.g., "GEN.1" or "GEN.1-GEN.3")
  const passageId = chapterStart === chapterEnd 
    ? `${bookId}.${chapterStart}`
    : `${bookId}.${chapterStart}-${bookId}.${chapterEnd}`
  
  // Fetch Bible passage
  const { data: passageData, isLoading } = useQuery(
    ['bible-passage', bibleVersion, passageId],
    () => apiClient.getPassage(bibleVersion, passageId),
    { enabled: !!bookId }
  )
  
  // Fetch highlights for this book
  useQuery(
    ['highlights', book, bibleVersion],
    () => apiClient.getHighlights(book, bibleVersion)
  )
  
  // Fetch notes for this book and chapters
  const { data: notesData } = useQuery(
    ['notes', book, chapterStart, bibleVersion],
    () => apiClient.getNotes(book, chapterStart, bibleVersion)
  )
  
  const notes: Note[] = notesData || []
  
  // Mutations
  const createHighlightMutation = useMutation(
    (data: { verse_id: string; color: string }) => apiClient.createHighlight({
      ...data,
      book,
      chapter: chapterStart,
      bible_version_id: bibleVersion
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['highlights'])
        setShowHighlightMenu(false)
        setSelectedVerse(null)
      }
    }
  )
  
  const createNoteMutation = useMutation(
    (content: string) => apiClient.createNote({
      content,
      book,
      chapter: chapterStart,
      verse_id: selectedVerse,
      bible_version_id: bibleVersion
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes'])
        setShowNoteModal(false)
        setNoteContent('')
        setSelectedVerse(null)
      }
    }
  )
  
  const deleteNoteMutation = useMutation(
    (noteId: number) => apiClient.deleteNote(noteId),
    {
      onSuccess: () => queryClient.invalidateQueries(['notes'])
    }
  )
  
  const handleHighlight = (color: string) => {
    if (selectedVerse) {
      createHighlightMutation.mutate({ verse_id: selectedVerse, color })
    }
  }
  
  const handleAddNote = () => {
    setShowHighlightMenu(false)
    setShowNoteModal(true)
  }
  
  const handleSaveNote = () => {
    if (noteContent.trim()) {
      createNoteMutation.mutate(noteContent)
    }
  }
  
  if (isLoading) {
    return <div className="text-center py-12">Loading Bible passage...</div>
  }
  
  if (!passageData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load Bible passage</p>
        <p className="text-sm text-gray-500 mt-2">Book: {book}, Chapters: {chapterStart}-{chapterEnd}</p>
        <p className="text-sm text-gray-500">Passage ID: {passageId}</p>
      </div>
    )
  }
  
  // Debug: Log the API response
  console.log('Bible API Response:', passageData)
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => planId ? navigate(`/reading-plan/${planId}`) : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {book} {chapterStart}{chapterEnd !== chapterStart && `-${chapterEnd}`}
          </h1>
          {day && <p className="text-gray-500 mt-1">Day {day} Reading</p>}
        </div>
      </div>
      
      {/* Bible Text */}
      <div className="card">
        {passageData.content ? (
          <div 
            className="prose prose-lg max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: passageData.content }}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No content available</p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(passageData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      {/* Highlight Menu */}
      {showHighlightMenu && selectedVerse && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg p-4 border border-gray-200 z-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleHighlight('yellow')}
              className="w-10 h-10 rounded-full bg-yellow-200 hover:bg-yellow-300 transition-colors"
              title="Yellow highlight"
            />
            <button
              onClick={() => handleHighlight('green')}
              className="w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 transition-colors"
              title="Green highlight"
            />
            <button
              onClick={() => handleHighlight('blue')}
              className="w-10 h-10 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"
              title="Blue highlight"
            />
            <button
              onClick={() => handleHighlight('pink')}
              className="w-10 h-10 rounded-full bg-pink-200 hover:bg-pink-300 transition-colors"
              title="Pink highlight"
            />
            <div className="w-px h-10 bg-gray-300 mx-2" />
            <button
              onClick={handleAddNote}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add note"
            >
              <StickyNote className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={() => {
                setShowHighlightMenu(false)
                setSelectedVerse(null)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}
      
      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Note</h3>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setNoteContent('')
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || createNoteMutation.isLoading}
                className="btn btn-primary flex-1"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setNoteContent('')
                }}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notes Section */}
      {notes.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <StickyNote className="h-5 w-5" />
            <span>Your Notes</span>
          </h2>
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {note.verse_id && (
                      <p className="text-sm font-medium text-gray-700 mb-1">{note.verse_id}</p>
                    )}
                    <p className="text-gray-800">{note.content}</p>
                  </div>
                  <button
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    className="p-1 hover:bg-yellow-100 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
