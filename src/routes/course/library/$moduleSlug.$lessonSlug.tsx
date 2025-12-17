import { createFileRoute } from '@tanstack/react-router'
import {
  loadLibraryContent,
  getLibraryModules,
  getLibraryComponent,
} from '@/helpers/file-helpers'
import Sidebar from '@/components/layout/sidebar'
import LessonsHeader from '@/components/layout/lessonsHeader'
import COMPONENT_MAP from '@/helpers/mdx-components-map'
import TableOfContents from '@/components/layout/tableOfContents/tableOfContents'
import { ProgressButton } from '@/components/progress/ProgressButton'
import { NextLessonButton } from '@/components/progress/NextLessonButton'
import SelectText from '@/components/notes/SelectText'
import styles from '../lesson.module.css'

export const Route = createFileRoute('/course/library/$moduleSlug/$lessonSlug')(
  {
    loader: async ({ params }) => {
      const { moduleSlug, lessonSlug } = params
      const lessonContent = await loadLibraryContent(moduleSlug, lessonSlug)
      const modules = await getLibraryModules()
      if (!lessonContent) {
        throw new Error(`Lesson not found: ${moduleSlug}/${lessonSlug}`)
      }
      // Return only serializable data (Component loaded client-side)
      return {
        frontmatter: lessonContent.frontmatter,
        headings: lessonContent.headings,
        modules,
        moduleSlug,
        lessonSlug,
      }
    },
    component: LessonDetail,
  },
)

function LessonDetail() {
  const { frontmatter, headings, modules, moduleSlug, lessonSlug } =
    Route.useLoaderData()

  // FORCE re-render when params change (key={...})
  // The component variable depends on moduleSlug/lessonSlug, but if React doesn't
  // see it as a state change or if the component identity is stable, it might not re-render.
  // Using key on the layout or main content is a good way to force it.

  // Get the component client-side (not serializable for SSR)
  const Component = getLibraryComponent(moduleSlug, lessonSlug)

  if (!Component) {
    return <div className="p-8 text-center">Lesson content not found</div>
  }

  const currentModuleIndex = modules.findIndex(
    (module) => module.moduleSlug === moduleSlug,
  )
  const currentModule = modules[currentModuleIndex]
  const lessons = currentModule?.lessons || []

  // Calculate next lesson or module
  const currentLessonIndex = lessons.findIndex(
    (lesson) => lesson.slug === lessonSlug,
  )
  let nextItem: {
    type: 'lesson' | 'module'
    moduleSlug: string
    lessonSlug: string
  } | null = null

  if (currentLessonIndex < lessons.length - 1) {
    // Next lesson in the same module
    nextItem = {
      type: 'lesson' as const,
      moduleSlug,
      lessonSlug: lessons[currentLessonIndex + 1].slug,
    }
  } else if (currentModuleIndex < modules.length - 1) {
    // First lesson in the next module
    const nextModule = modules[currentModuleIndex + 1]
    if (nextModule.lessons.length > 0) {
      nextItem = {
        type: 'module' as const,
        moduleSlug: nextModule.moduleSlug,
        lessonSlug: nextModule.lessons[0].slug,
      }
    }
  }

  return (
    <div
      key={moduleSlug + lessonSlug}
      className={`${styles.lessons_grid} gap-12 bg-(--bg-color) min-h-full`}
    >
      <div className={styles.sidebar}>
        <Sidebar
          moduleBadge={frontmatter.moduleBadge}
          moduleSlug={moduleSlug}
          lessonSlug={lessonSlug}
          lessons={lessons}
          basePath="/course/library"
          homePath="/course/library"
        />
      </div>

      <main className={`${styles.content} flex flex-col`}>
        <LessonsHeader
          moduleBadge={frontmatter.moduleBadge}
          moduleSlug={moduleSlug}
          lessons={lessons}
          lessonSlug={lessonSlug}
          basePath="/course/library"
        />
        <article
          className={`${styles.content_area} text-(--text-color-primary-800) md:mx-2 px-4 md:px-16 pt-16 pb-24 border border-(--text-color-primary-300) rounded-lg bg-(--bg-color) relative`}
        >
          <h1 className="mb-10 text-3xl font-bold">{frontmatter.title}</h1>
          {Component ? (
            <Component components={COMPONENT_MAP} />
          ) : (
            <p className="text-red-500">Loading content...</p>
          )}
          {/* Note-taking: Select text to create notes */}
          <SelectText moduleSlug={moduleSlug} lessonSlug={lessonSlug} />
        </article>
        <div className="flex gap-4 px-4 md:px-16">
          <ProgressButton moduleSlug={moduleSlug} lessonSlug={lessonSlug} />
          <NextLessonButton
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            nextItem={nextItem}
            basePath="/course/library"
          />
        </div>
      </main>
      <aside
        className={`${styles.table_of_contents} hidden md:block sticky top-0 h-screen overflow-auto`}
      >
        <TableOfContents headings={headings} />
      </aside>
    </div>
  )
}
