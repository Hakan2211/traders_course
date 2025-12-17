import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/context/progress/ProgressContext'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

type ProgressButtonProps = {
  moduleSlug: string
  lessonSlug: string
}

export function ProgressButton({
  moduleSlug,
  lessonSlug,
}: ProgressButtonProps) {
  const { isLessonCompleted, updateProgress } = useProgress()
  const [isUpdating, setIsUpdating] = useState(false)
  const completed = isLessonCompleted(moduleSlug, lessonSlug)

  const handleClick = async () => {
    try {
      setIsUpdating(true)
      await updateProgress(moduleSlug, lessonSlug, !completed)
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isUpdating}
      variant={completed ? 'outline' : 'default'}
      className={`my-8 gap-2 ${
        completed
          ? 'bg-(--module-badge) hover:bg-[#9A7019] text-(--text-color-primary-100) hover:text-(--text-color-primary-100) cursor-pointer'
          : 'bg-transparent border border-(--text-color-primary-600) text-(--text-color-primary-600) hover:bg-(--text-color-primary-300) hover:text-(--text-color-primary-800) cursor-pointer'
      }`}
    >
      {isUpdating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : completed ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      {completed ? 'Completed' : 'Mark as Complete'}
    </Button>
  )
}
