import { createFileRoute } from '@tanstack/react-router'
import { getCourseModules } from '@/helpers/file-helpers'
import styles from './course.module.css'
import { formatModuleSlug } from '@/lib/utils'
import HeroScene from '@/components/hero/HeroScene'
import NavBar from '@/components/hero/NavBar'
import { LessonLink } from './LessonLink'

export const Route = createFileRoute('/course/')({
  loader: async () => {
    const modules = await getCourseModules()
    return { modules }
  },
  component: CourseOverview,
})

function CourseOverview() {
  const { modules } = Route.useLoaderData()

  return (
    <div className="flex flex-col min-h-screen bg-(--bg-color)">
      <div className="relative">
        <NavBar />
        <HeroScene />
      </div>

      <div className={`${styles.gridContainer} tracking-[0.3px]`}>
        <div className={styles.gridContent}>
          {modules.map((module) => (
            <div key={module.moduleSlug} className={styles.module}>
              {module.lessons[0]?.moduleImage && (
                <div className={styles.moduleImageContainer}>
                  <img
                    src={module.lessons[0].moduleImage}
                    alt={formatModuleSlug(module.moduleSlug)}
                    width={1200}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[50%] flex flex-col justify-center">
                  {module.lessons[0]?.moduleBadge && (
                    <span className="text-(--module-badge)">
                      {module.lessons[0].moduleBadge}
                    </span>
                  )}
                  <h2 className="font-semibold mt-0 text-lg pb-4 text-(--text-color-primary-800)">
                    {formatModuleSlug(module.moduleSlug)}
                  </h2>
                  {module.lessons[0]?.moduleDescription && (
                    <p className="max-w-[36ch] text-(--text-color-primary-600)">
                      {module.lessons[0].moduleDescription}
                    </p>
                  )}
                </div>

                <div className="border-l border-(--text-color-primary-300) my-1 mx-4 hidden md:block"></div>
                <div className="md:hidden w-full my-4 border-t border-(--text-color-primary-300)"></div>
                <ul className="md:w-[50%] md:pl-[8px]">
                  {module.lessons.map((lesson) => (
                    <LessonLink
                      key={lesson.slug}
                      moduleSlug={module.moduleSlug}
                      lesson={lesson}
                    />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
