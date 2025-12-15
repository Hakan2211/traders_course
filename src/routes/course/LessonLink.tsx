import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Circle } from 'lucide-react'
// import { useProgress } from '@/context/progress/ProgressContext'
// import { CheckCircle } from 'lucide-react'

interface LessonLinkProps {
  moduleSlug: string
  lesson: {
    slug: string
    title: string
    [key: string]: any
  }
}

export function LessonLink({ moduleSlug, lesson }: LessonLinkProps) {
  // const { getLessonStatus } = useProgress()
  // const status = getLessonStatus(moduleSlug, lesson.slug)
  const status = 'pending' // Default for now

  return (
    <li className="mb-2 list-none">
      <Link
        to="/course/$moduleSlug/$lessonSlug"
        params={{ moduleSlug, lessonSlug: lesson.slug }}
        className={cn(
          'flex justify-between items-center text-[var(--text-color-primary-800)] p-2 rounded-lg -ml-2 hover:bg-[var(--text-color-primary-300)] transition-colors duration-200',
          lesson.parent ? 'pl-8 text-sm' : '',
        )}
      >
        {/* {status === 'completed' ? (
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
        )} */}
        <span className="text-sm md:text-base">{lesson.title}</span>
      </Link>
    </li>
  )
}
