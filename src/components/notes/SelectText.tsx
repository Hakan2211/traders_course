import { useEffect, useState, useRef } from 'react'
import NotesIcon from '../icons/notesIcon'
import NotesDialog from './NotesDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '../ui/dialog'
import { createNote } from '@/lib/notesCrud'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

interface SelectTextProps {
  moduleSlug: string
  lessonSlug: string
}

export default function SelectText({
  moduleSlug,
  lessonSlug,
}: SelectTextProps) {
  const [selection, setSelection] = useState<string>()
  const [position, setPosition] = useState<Record<string, number>>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const selectionRef = useRef<string>()
  const router = useRouter()

  function onSelectStart() {
    setSelection(undefined)
  }

  function onSelectEnd() {
    const activeSelection = document.getSelection()
    const text = activeSelection?.toString()

    if (!activeSelection || !text) {
      setSelection(undefined)
      selectionRef.current = undefined
      console.log('Text selected:', text)
      return
    }

    setSelection(text)
    selectionRef.current = text
    const rect = activeSelection.getRangeAt(0).getBoundingClientRect()

    setPosition({
      x: rect.left + rect.width / 2 - 80 / 2,
      y: rect.top + window.scrollY - 30,
      width: rect.width,
      height: rect.height,
    })
  }

  useEffect(() => {
    document.addEventListener('selectstart', onSelectStart)
    document.addEventListener('mouseup', onSelectEnd)
    return () => {
      document.removeEventListener('selectstart', onSelectStart)
      document.removeEventListener('mouseup', onSelectEnd)
    }
  }, [])

  async function onAddNote(noteText?: string) {
    console.log('Creating note with:', {
      moduleSlug,
      lessonSlug,
      selection,
      noteText,
    })

    const currentSelection = selectionRef.current
    if (!noteText || !currentSelection) return

    setIsLoading(true)

    try {
      await createNote(moduleSlug, lessonSlug, currentSelection, noteText)

      setIsDialogOpen(false)
      setSelection(undefined)
      selectionRef.current = undefined
      router.invalidate()
      toast.success('Note saved successfully') // Optional: show success message
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Failed to save note') // Optional: show error message
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50" />
          <DialogContent
            className="sm:max-w-[425px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle>Note</DialogTitle>
              <DialogDescription>Notes Textarea</DialogDescription>
            </DialogHeader>
            {/* Your existing DialogContent */}
            <NotesDialog
              onAddNote={onAddNote}
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <div role="dialog" aria-labelledby="note" aria-haspopup="dialog">
        {selection && position && (
          <p
            className="
              absolute -top-4 left-0 w-[80px] h-[30px] bg-[var(--module-badge)] text-[var(--text-color-primary-800)] rounded m-0
              after:absolute after:top-full after:left-1/2 after:-translate-x-2 after:h-0 after:w-0 after:border-x-[6px] after:border-x-transparent after:border-b-[8px] after:border-b-[var(--module-badge)] after:rotate-180
            "
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
          >
            <button
              className="flex w-full h-full justify-between items-center px-2"
              onClick={(e) => {
                e.stopPropagation()
                setIsDialogOpen(true)
              }}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <span id="note" className="text-base">
                Note
              </span>
              <NotesIcon className="w-6 h-6" />
            </button>
          </p>
        )}
      </div>
    </>
  )
}
