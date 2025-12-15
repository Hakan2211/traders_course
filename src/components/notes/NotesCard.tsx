import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TrashIcon from '@/components/icons/trashIcon'
import { Note } from '@/lib/notesCrud'
import { deleteNote } from '@/lib/notesCrud'
import { useRouter } from '@tanstack/react-router'
import { parseModuleSlug, parseLessonSlug } from '@/lib/utils'
import { toast } from 'sonner'

type NotesCardProps = {
  note: Note
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function NotesCard({ note }: NotesCardProps) {
  const router = useRouter()
  const handleDelete = async () => {
    await deleteNote(note.id)
    toast.success('Note deleted successfully')
    router.invalidate()
  }

  const { chapter: moduleChapter, moduleName } = parseModuleSlug(
    note.module_slug,
  )
  const {
    chapter: lessonChapter,
    lessonNumber,
    sublessonNumber,
    lessonTitle,
  } = parseLessonSlug(note.lesson_slug)

  // Optional: Ensure chapter numbers match
  const displayChapter =
    moduleChapter === lessonChapter
      ? moduleChapter
      : `${moduleChapter}/${lessonChapter}`

  return (
    <Card className="bg-[#1D2535] border-[var(--text-color-primary-400)] max-w-[500px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-color-primary-600)]">
            {formatDate(note.created_at)}
          </span>
          <Button
            onClick={handleDelete}
            className="flex items-center gap-2 group bg-transparent border-none "
          >
            <TrashIcon className="w-5 h-5 mb-1 group-hover:text-red-800 transition-all duration-300" />
          </Button>
        </div>

        <CardTitle className="">
          <div className="mb-2 text-sm text-[var(--module-badge)] px-1 border rounded-xl border-[var(--module-badge)] w-fit">
            {/* {note.module_slug} */}
            <span className="">Chapter {moduleChapter}:</span>{' '}
            {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
          </div>
          <div className="text-lg mb-4 text-[var(--text-color-primary-800)] tracking-wide ">
            {/* {note.lesson_slug} */}
            <span>Lesson {lessonNumber}</span>
            {sublessonNumber && `.${sublessonNumber}`}:{' '}
            {lessonTitle.charAt(0).toUpperCase() + lessonTitle.slice(1)}
          </div>
        </CardTitle>
        <CardDescription className="flex flex-col">
          <span className="pl-2 border-l-2 border-transparent">
            Selected Text:
          </span>
          <span className="border-l-2 border-[var(--text-color-primary-400)] pl-2">
            {note.selected_text}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xl text-[var(--text-color-primary-800)]">
        <p>{note.note_text}</p>
      </CardContent>
    </Card>
  )
}
