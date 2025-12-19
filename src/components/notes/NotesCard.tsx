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
import { useRouter, Link } from '@tanstack/react-router'
import { parseModuleSlug, parseLessonSlug } from '@/lib/utils'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'

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
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNote(note.id)
    toast.success('Note deleted successfully')
    router.invalidate()
  }

  const { chapter: moduleChapter, moduleName } = parseModuleSlug(
    note.module_slug,
  )
  const { lessonNumber, sublessonNumber, lessonTitle } = parseLessonSlug(
    note.lesson_slug,
  )

  return (
    <Card className="bg-[#1D2535] border-(--text-color-primary-400) max-w-[500px] hover:border-[#B0811C] transition-colors duration-200 group">
      <Link
        to="/course/$moduleSlug/$lessonSlug"
        params={{
          moduleSlug: note.module_slug,
          lessonSlug: note.lesson_slug,
        }}
        className="block"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm text-(--text-color-primary-600)">
              {formatDate(note.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-(--text-color-primary-600) opacity-0 group-hover:opacity-100 transition-opacity" />
              <Button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-transparent  border-none hover:bg-red-500/10"
              >
                <TrashIcon className="w-5 h-5 mb-1 hover:text-red-500 text-red-700 transition-all duration-300" />
              </Button>
            </div>
          </div>

          <CardTitle>
            <div className="mb-2 text-sm text-(--module-badge) px-2 py-0.5 border rounded-xl border-(--module-badge) w-fit">
              <span>Chapter {moduleChapter}:</span>{' '}
              {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
            </div>
            <div className="text-lg mb-4 text-(--text-color-primary-800) tracking-wide group-hover:text-[#B0811C] transition-colors">
              <span>Lesson {lessonNumber}</span>
              {sublessonNumber && `.${sublessonNumber}`}:{' '}
              {lessonTitle.charAt(0).toUpperCase() + lessonTitle.slice(1)}
            </div>
          </CardTitle>
          <CardDescription className="flex flex-col">
            <span className="pl-2 border-l-2 border-transparent text-(--text-color-primary-600)">
              Selected Text:
            </span>
            <span className="border-l-2 border-(--text-color-primary-400) pl-2 text-(--text-color-primary-700) italic">
              "{note.selected_text}"
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-base text-(--text-color-primary-800)">
          <p>{note.note_text}</p>
        </CardContent>
      </Link>
    </Card>
  )
}
