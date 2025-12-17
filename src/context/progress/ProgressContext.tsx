import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { updateProgressFn, getProgressFn } from '@/lib/progressCrud'

type ProgressContextType = {
  progress: Record<string, Record<string, boolean>>
  isLoading: boolean
  updateProgress: (
    moduleSlug: string,
    lessonSlug: string,
    completed: boolean,
  ) => Promise<void>
  isLessonCompleted: (moduleSlug: string, lessonSlug: string) => boolean
  refetchProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<
    Record<string, Record<string, boolean>>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getProgressFn()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
      setProgress({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const updateProgress = async (
    moduleSlug: string,
    lessonSlug: string,
    completed: boolean,
  ) => {
    try {
      await updateProgressFn({ data: { moduleSlug, lessonSlug, completed } })
      setProgress((prev) => {
        const newProgress = { ...prev }
        if (!newProgress[moduleSlug]) {
          newProgress[moduleSlug] = {}
        }
        newProgress[moduleSlug][lessonSlug] = completed
        return newProgress
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  const isLessonCompleted = (
    moduleSlug: string,
    lessonSlug: string,
  ): boolean => {
    return progress[moduleSlug]?.[lessonSlug] === true
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        updateProgress,
        isLessonCompleted,
        refetchProgress: fetchProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
