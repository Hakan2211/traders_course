import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import NotesIcon from '../icons/notesIcon'
import LibraryIcon from '../icons/libraryIcon'
import { AccountMenu } from './accountMenu'
import { useRouter, getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

const routeApi = getRouteApi('__root__')

export function LessonsNav() {
  const router = useRouter()
  const { session } = routeApi.useLoaderData()
  const [isLibraryPending, startLibraryTransition] = useTransition()
  const [isNotesPending, startNotesTransition] = useTransition()

  const handleNavigation = (
    href: string,
    startTransition: React.TransitionStartFunction,
  ) => {
    startTransition(() => {
      router.navigate({ to: href })
    })
  }

  return (
    <TooltipProvider delayDuration={0}>
      <nav>
        <ul className="text-(--text-color-primary-800) flex items-center gap-4">
          {session && (
            <li className="cursor-default px-2 hidden sm:block">
              <span className="text-sm font-medium text-(--text-color-primary-600)">
                Welcome, {session.user.name || session.user.username}
              </span>
            </li>
          )}
          <li className="cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    handleNavigation('/course/library', startLibraryTransition)
                  }
                  disabled={isLibraryPending}
                  className="focus:outline-none"
                >
                  <span>
                    {isLibraryPending ? (
                      <Loader2 className="w-6 h-6 animate-spin translate-y-[2px] text-(--module-badge)" />
                    ) : (
                      <LibraryIcon className="w-6 h-6 hover:text-yellow-600 transition-colors duration-300 translate-y-[2px]" />
                    )}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Library</p>
              </TooltipContent>
            </Tooltip>
          </li>
          <li className="cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    handleNavigation('/course/notes', startNotesTransition)
                  }
                  disabled={isNotesPending}
                  className="focus:outline-none"
                >
                  {isNotesPending ? (
                    <Loader2 className="w-6 h-6 animate-spin text-(--module-badge)" />
                  ) : (
                    <NotesIcon className="w-6 h-6 hover:text-yellow-600 transition-colors duration-300" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notes</p>
              </TooltipContent>
            </Tooltip>
          </li>
          <li className="cursor-pointer">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <AccountMenu />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account</p>
              </TooltipContent>
            </Tooltip>
          </li>
        </ul>
      </nav>
    </TooltipProvider>
  )
}
