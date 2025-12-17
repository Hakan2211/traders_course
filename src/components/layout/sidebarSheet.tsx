import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import MenuIcon from '../icons/menuIcon'
import { Link } from '@tanstack/react-router'
import HomeIcon from '../icons/homeIcon'

import { formatModuleSlug } from '@/lib/utils'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type SidebarProps = {
  moduleBadge?: string
  moduleSlug: string
  lessonSlug: string
  lessons: { slug: string; title: string; parent: string | null }[]
  basePath?: string
  homePath?: string
}

function SideBarSheet({
  moduleBadge,
  moduleSlug,
  lessonSlug,
  lessons,
  homePath = '/course',
  basePath = '/course',
}: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger className="text-(--text-color-primary-800) flex justify-center items-center w-full mt-3">
        <MenuIcon className="w-6 h-6 text-(--text-color-primary-800)" />
      </SheetTrigger>
      <SheetContent
        className="w-76 bg-(--bg-color) text-(--text-color-primary-800)"
        side={'left'}
      >
        <SheetTitle className="sr-only">Sidebar</SheetTitle>

        <div>
          <header className="h-12 flex items-center mb-4">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={homePath}>
                    <span className="">
                      <HomeIcon className="w-6 h-6 text-(--text-color-primary-800) hover:text-yellow-600 transition-colors duration-300" />
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </header>

          <h2 className="flex flex-col mb-6 text-xl font-semibold text-(--text-color-primary-800) ">
            <span className="text-(--text-color-primary-600) font-normal text-base">
              {moduleBadge}
            </span>
            {formatModuleSlug(moduleSlug)}
          </h2>
        </div>
        <SheetClose>
          <span className="sr-only">Close</span>
        </SheetClose>

        <div>
          <ul>
            {lessons.map((lesson) => (
              <li
                key={lesson.slug}
                className={`text-(--text-color-primary-800) p-2 rounded-lg -ml-2 hover:bg-(--text-color-primary-300) transition-colors duration-200 ${
                  lesson.parent ? 'pl-8 text-sm' : ''
                } ${
                  lesson.slug === lessonSlug
                    ? 'bg-(--text-color-primary-300) font-medium'
                    : ''
                }`}
              >
                <Link
                  to={`${basePath}/$moduleSlug/$lessonSlug` as any}
                  params={{ moduleSlug, lessonSlug: lesson.slug } as any}
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <SheetDescription className="sr-only">
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </SheetDescription>
      </SheetContent>
    </Sheet>
  )
}

export default SideBarSheet
