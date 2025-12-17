import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllNotesFn } from '@/lib/notesCrud'
import NotesCard from '@/components/notes/NotesCard'
import { ArrowLeft, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/course/notes')({
  loader: async () => {
    const notes = await getAllNotesFn()
    return { notes }
  },
  component: NotesPage,
})

function NotesPage() {
  const { notes } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-(--bg-color) text-(--text-color-primary-800)">
      {/* Header */}
      <header className="border-b border-(--text-color-primary-300) bg-(--bg-color)/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/course">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-(--text-color-primary-600) hover:text-(--text-color-primary-800)"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-[#B0811C]" />
            <h1 className="text-xl font-semibold">My Notes</h1>
          </div>
          <div className="w-[120px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <StickyNote className="w-16 h-16 text-(--text-color-primary-400) mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No notes yet</h2>
            <p className="text-(--text-color-primary-600) max-w-md mb-6">
              Start taking notes while reading lessons. Select text and add your
              thoughts to remember key concepts.
            </p>
            <Link to="/course">
              <Button className="bg-[#B0811C] hover:bg-[#9a7019] text-black">
                Go to Course
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-(--text-color-primary-600)">
                You have {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NotesCard key={note.id} note={note} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
