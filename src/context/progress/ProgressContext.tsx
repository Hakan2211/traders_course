import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { updateProgressFn, getProgressFn } from '@/lib/progressCrud'

type LessonProgress = {
  module_slug: string
  lesson_slug: string
  status: 'started' | 'completed'
}

type ProgressContextType = {
  progress: Record<string, Record<string, boolean>>
  isLoading: boolean
  updateProgress: (
    moduleSlug: string,
    lessonSlug: string,
    status: 'started' | 'completed',
  ) => Promise<void>
  getLessonStatus: (
    moduleSlug: string,
    lessonSlug: string,
  ) => 'not_started' | 'started' | 'completed'
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
      // Ensure we are calling the server function
      const data = await getProgressFn()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
      // Fallback for demo/dev if server fetch fails
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
    status: 'started' | 'completed',
  ) => {
    try {
      await updateProgressFn({ moduleSlug, lessonSlug, status })
      setProgress((prev) => {
        const newProgress = { ...prev }
        if (!newProgress[moduleSlug]) {
          newProgress[moduleSlug] = {}
        }
        newProgress[moduleSlug][lessonSlug] = status === 'completed'
        return newProgress
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const getLessonStatus = (moduleSlug: string, lessonSlug: string) => {
    if (!progress[moduleSlug]) return 'not_started'
    const isCompleted = progress[moduleSlug][lessonSlug]
    if (isCompleted === true) return 'completed'
    return isCompleted
      ? 'completed'
      : progress[moduleSlug][lessonSlug] !== undefined
        ? 'started'
        : 'not_started'
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        updateProgress,
        getLessonStatus,
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
