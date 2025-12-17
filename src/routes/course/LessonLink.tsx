import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Circle, CheckCircle } from 'lucide-react'
import { useProgress } from '@/context/progress/ProgressContext'

interface LessonLinkProps {
  moduleSlug: string
  lesson: {
    slug: string
    title: string
    [key: string]: any
  }
}

export function LessonLink({ moduleSlug, lesson }: LessonLinkProps) {
  const { isLessonCompleted } = useProgress()
  const completed = isLessonCompleted(moduleSlug, lesson.slug)

  return (
    <li className="mb-2 list-none">
      <Link
        to="/course/$moduleSlug/$lessonSlug"
        params={{ moduleSlug, lessonSlug: lesson.slug }}
        className={cn(
          'flex items-center gap-3 text-(--text-color-primary-800) p-2 rounded-lg -ml-2 hover:bg-(--text-color-primary-300) transition-colors duration-200',
          lesson.parent ? 'pl-8 text-sm' : '',
        )}
      >
        {completed ? (
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-(--text-color-primary-400) shrink-0" />
        )}
        <span className="text-sm md:text-base">{lesson.title}</span>
      </Link>
    </li>
  )
}
