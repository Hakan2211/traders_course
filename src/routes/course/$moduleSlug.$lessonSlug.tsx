import { createFileRoute } from '@tanstack/react-router'
import {
  loadLessonContent,
  getCourseModules,
  getLessonComponent,
} from '@/helpers/file-helpers'
import Sidebar from '@/components/layout/sidebar'
import LessonsHeader from '@/components/layout/lessonsHeader'
import COMPONENT_MAP from '@/helpers/mdx-components-map'
import TableOfContents from '@/components/layout/tableOfContents/tableOfContents'
// import { ProgressButton } from '@/components/progress/ProgressButton';
// import { NextLessonButton } from '@/components/progress/NextLessonButton';
// import SelectText from '@/components/notes/SelectText';
import styles from './lesson.module.css'

export const Route = createFileRoute('/course/$moduleSlug/$lessonSlug')({
  loader: async ({ params }) => {
    const { moduleSlug, lessonSlug } = params
    const lessonContent = await loadLessonContent(moduleSlug, lessonSlug)
    const modules = await getCourseModules()
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
})

function LessonDetail() {
  const { frontmatter, headings, modules, moduleSlug, lessonSlug } =
    Route.useLoaderData()

  // Get the component client-side (not serializable for SSR)
  const Component = getLessonComponent(moduleSlug, lessonSlug)

  const currentModuleIndex = modules.findIndex(
    (module) => module.moduleSlug === moduleSlug,
  )
  const currentModule = modules[currentModuleIndex]
  const lessons = currentModule?.lessons || []

  // Uncomment when NextLessonButton is enabled
  // const currentLessonIndex = lessons.findIndex(
  //   (lesson) => lesson.slug === lessonSlug,
  // )
  // let nextItem = null
  // if (currentLessonIndex < lessons.length - 1) {
  //   nextItem = { type: 'lesson' as const, moduleSlug, lessonSlug: lessons[currentLessonIndex + 1].slug }
  // } else if (currentModuleIndex < modules.length - 1) {
  //   const nextModule = modules[currentModuleIndex + 1]
  //   if (nextModule.lessons.length > 0) {
  //     nextItem = { type: 'module' as const, moduleSlug: nextModule.moduleSlug, lessonSlug: nextModule.lessons[0].slug }
  //   }
  // }
  void currentModuleIndex // Keep for future use

  return (
    <div className={`${styles.lessons_grid} gap-12 bg-(--bg-color) min-h-full`}>
      <div className={styles.sidebar}>
        <Sidebar
          moduleBadge={frontmatter.moduleBadge}
          moduleSlug={moduleSlug}
          lessonSlug={lessonSlug}
          lessons={lessons}
        />
      </div>

      <main className={`${styles.content} flex flex-col`}>
        <LessonsHeader
          moduleBadge={frontmatter.moduleBadge}
          moduleSlug={moduleSlug}
          lessons={lessons}
          lessonSlug={lessonSlug}
        />
        <article
          className={`${styles.content_area} text-(--text-color-primary-800) md:mx-2 px-4 md:px-16 pt-16 pb-24 border border-(--text-color-primary-300) rounded-lg bg-(--bg-color)`}
        >
          <h1 className="mb-10 text-3xl font-bold">{frontmatter.title}</h1>
          {Component ? (
            <Component components={COMPONENT_MAP} />
          ) : (
            <p className="text-red-500">Loading content...</p>
          )}
        </article>
        <div className="flex gap-4">
          {/* <ProgressButton moduleSlug={moduleSlug} lessonSlug={lessonSlug} /> */}
          {/* <NextLessonButton
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            nextItem={nextItem}
          /> */}
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
