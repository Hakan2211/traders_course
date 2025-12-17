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
  basePath?: string
}

export function LessonLink({
  moduleSlug,
  lesson,
  basePath = '/course',
}: LessonLinkProps) {
  const { isLessonCompleted } = useProgress()
  const completed = isLessonCompleted(moduleSlug, lesson.slug)

  return (
    <li className="mb-2 list-none">
      <Link
        to={`${basePath}/$moduleSlug/$lessonSlug` as any}
        params={{ moduleSlug, lessonSlug: lesson.slug } as any}
        className={cn(
          'flex items-center justify-between gap-3 text-(--text-color-primary-800) p-2 rounded-lg -ml-2 hover:bg-(--text-color-primary-300) transition-colors duration-200',
          lesson.parent ? 'pl-8 text-sm' : '',
        )}
      >
        <span className="text-sm md:text-base">{lesson.title}</span>{' '}
        {completed ? (
          <CheckCircle className="w-5 h-5 text-(--module-badge) shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-(--text-color-primary-400) shrink-0" />
        )}
      </Link>
    </li>
  )
}
