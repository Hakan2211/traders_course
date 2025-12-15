import { useProgress } from '@/context/progress/ProgressContext'
import { Button } from '../ui/button'
import { useRouter } from '@tanstack/react-router'
import { useTransition, useState } from 'react'
import { Loader2 } from 'lucide-react'

type NextLessonButtonProps = {
  moduleSlug: string
  lessonSlug: string
  nextItem: {
    type: 'lesson' | 'module'
    moduleSlug: string
    lessonSlug?: string
  } | null
  basePath?: string
  skipProgress?: boolean
}

export function NextLessonButton({
  moduleSlug,
  lessonSlug,
  nextItem,
  basePath = '/course',
  skipProgress = false,
}: NextLessonButtonProps) {
  const router = useRouter()
  const { updateProgress } = useProgress()
  const [isPending, startTransition] = useTransition()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleClick = async () => {
    setIsUpdating(true)
    try {
      if (!skipProgress) {
        await updateProgress(moduleSlug, lessonSlug, 'completed')
      }

      if (nextItem) {
        startTransition(() => {
          router.navigate({
            to: `${basePath}/${nextItem.moduleSlug}/${nextItem.lessonSlug}`,
          })
        })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (!nextItem) {
    return null // Don't render the button if there's no next item
  }

  const isLoading = isUpdating || isPending
  const buttonText = nextItem.type === 'lesson' ? 'Next Lesson' : 'Next Module'

  return (
    <Button
      className="my-8 gap-2"
      onClick={handleClick}
      variant="notStartedButton"
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {buttonText}
    </Button>
  )
}
