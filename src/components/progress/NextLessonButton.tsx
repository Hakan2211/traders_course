import { useProgress } from '@/context/progress/ProgressContext'
import { Button } from '../ui/button'
import { useRouter } from '@tanstack/react-router'
import { useTransition, useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'

type NextLessonButtonProps = {
  moduleSlug: string
  lessonSlug: string
  nextItem: {
    type: 'lesson' | 'module'
    moduleSlug: string
    lessonSlug: string
  } | null
  skipProgress?: boolean
}

export function NextLessonButton({
  moduleSlug,
  lessonSlug,
  nextItem,
  skipProgress = false,
}: NextLessonButtonProps) {
  const router = useRouter()
  const { updateProgress } = useProgress()
  const [isPending, startTransition] = useTransition()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleClick = async () => {
    setIsUpdating(true)
    try {
      // Mark current lesson as completed before navigating
      if (!skipProgress) {
        await updateProgress(moduleSlug, lessonSlug, true)
      }

      if (nextItem) {
        startTransition(() => {
          router.navigate({
            to: '/course/$moduleSlug/$lessonSlug',
            params: {
              moduleSlug: nextItem.moduleSlug,
              lessonSlug: nextItem.lessonSlug,
            },
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
      className="my-8 gap-2 bg-[#B0811C] hover:bg-[#9a7019] text-black"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {buttonText}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </Button>
  )
}
