import useWindowSize from '@/hooks/useWindowSize'
import styles from '@/routes/course/lesson.module.css'
import SideBarSheet from './sidebarSheet'
import HomeIcon from '../icons/homeIcon'
import { Link } from '@tanstack/react-router'
import { formatModuleSlug } from '@/lib/utils'
// import { LessonStatus } from '../progress/LessonStatus'
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

function Sidebar({
  moduleBadge,
  moduleSlug,
  lessonSlug,
  lessons,
  basePath = '/course',
  homePath = '/course',
}: SidebarProps) {
  const { width } = useWindowSize()
  const effectiveWidth = width ?? 0
  return effectiveWidth < 1199 && effectiveWidth > 768 ? (
    <aside>
      <SideBarSheet
        moduleBadge={moduleBadge}
        moduleSlug={moduleSlug}
        lessonSlug={lessonSlug}
        lessons={lessons}
        basePath={basePath}
        homePath={homePath}
      />
    </aside>
  ) : (
    <aside className={`${styles.sidebar}  bg-(--bg-color) pl-4 pr-8`}>
      <div className="sticky top-0 w-full">
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
        <div className="">
          <ul>
            {lessons.map((lesson) => (
              <li
                key={lesson.slug}
                className={`w-full  text-(--text-color-primary-800) p-2 rounded-lg -ml-2 hover:bg-linear-to-r from-gray-950/90 to-black/90 transition-colors duration-200 ${
                  lesson.parent ? 'pl-8 text-sm' : ''
                } ${
                  lesson.slug === lessonSlug
                    ? 'bg-(--text-color-primary-300)'
                    : ''
                }`}
              >
                <Link
                  className="w-full flex justify-between items-center gap-8"
                  to="/course/$moduleSlug/$lessonSlug"
                  params={{ moduleSlug, lessonSlug: lesson.slug }}
                >
                  <span
                    className="flex-1 min-w-0 whitespace-normal wrap-break-word"
                    title={lesson.title}
                  >
                    {lesson.title}
                  </span>
                  <span className="shrink-0">
                    {/* <LessonStatus
                      moduleSlug={moduleSlug}
                      lessonSlug={lesson.slug}
                    /> */}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
