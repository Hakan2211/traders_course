import { slugify } from '@/lib/utils'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import type { Heading, Root } from 'mdast'
import type { ComponentType } from 'react'

type Frontmatter = {
  title: string
  order: number
  parent: string | null
  moduleBadge?: string
  moduleDescription?: string
  moduleImage?: string
  [key: string]: any
}

type Lesson = {
  slug: string
  title: string
  order: number
  parent: string | null
  moduleBadge?: string
  moduleDescription?: string
  moduleImage?: string
}

type Module = {
  moduleSlug: string
  lessons: Lesson[]
}

type MDXModule = {
  default: ComponentType
  frontmatter: Frontmatter
}

// Import all MDX modules eagerly
const courseModulesGlob = import.meta.glob<MDXModule>('/content/**/*.mdx', {
  eager: true,
})
const courseRawGlob = import.meta.glob<string>('/content/**/*.mdx', {
  query: '?raw',
  eager: true,
})

const libraryModulesGlob = import.meta.glob<MDXModule>('/library/**/*.mdx', {
  eager: true,
})
const libraryRawGlob = import.meta.glob<string>('/library/**/*.mdx', {
  query: '?raw',
  eager: true,
})

function parsePath(path: string, baseDir: string) {
  // path is like "/content/00-introduction/01-welcome.mdx"
  const relative = path.replace(baseDir, '').replace(/^\//, '')
  const parts = relative.split('/')
  if (parts.length < 2) return null

  const moduleSlug = parts[0]
  const filename = parts[1]
  const lessonSlug = filename.replace(/\.mdx$/, '')

  return { moduleSlug, lessonSlug }
}

async function getModulesFromGlob(
  modulesGlob: Record<string, MDXModule>,
  baseDir: string,
): Promise<Module[]> {
  const keys = Object.keys(modulesGlob)
  console.log(`[FileHelper] Glob keys found for ${baseDir}: ${keys.length}`)
  if (keys.length > 0) console.log(`[FileHelper] Sample key: ${keys[0]}`)

  const modulesMap = new Map<string, Lesson[]>()

  for (const [path, mod] of Object.entries(modulesGlob)) {
    const parsed = parsePath(path, baseDir)
    if (!parsed) continue

    const { moduleSlug, lessonSlug } = parsed
    const { frontmatter } = mod

    const lesson: Lesson = {
      slug: lessonSlug,
      title: frontmatter.title,
      order: frontmatter.order,
      parent: frontmatter.parent || null,
      moduleBadge: frontmatter.moduleBadge,
      moduleDescription: frontmatter.moduleDescription,
      moduleImage: frontmatter.moduleImage,
    }

    if (!modulesMap.has(moduleSlug)) {
      modulesMap.set(moduleSlug, [])
    }
    modulesMap.get(moduleSlug)?.push(lesson)
  }

  const modules: Module[] = Array.from(modulesMap.entries()).map(
    ([moduleSlug, lessons]) => {
      const sortedLessons: Lesson[] = []
      const childrenMap = new Map<string, Lesson[]>()
      const roots: Lesson[] = []

      // Separate roots and children
      for (const lesson of lessons) {
        if (lesson.parent) {
          if (!childrenMap.has(lesson.parent)) {
            childrenMap.set(lesson.parent, [])
          }
          childrenMap.get(lesson.parent)?.push(lesson)
        } else {
          roots.push(lesson)
        }
      }

      // Helper to recursively get sorted children
      const getSortedChildren = (parentSlug: string): Lesson[] => {
        const children = childrenMap.get(parentSlug) || []
        children.sort((a, b) => a.order - b.order)
        const result: Lesson[] = []
        for (const child of children) {
          result.push(child)
          result.push(...getSortedChildren(child.slug))
        }
        return result
      }

      // Sort roots and build hierarchy
      roots.sort((a, b) => a.order - b.order)

      for (const root of roots) {
        sortedLessons.push(root)
        sortedLessons.push(...getSortedChildren(root.slug))
      }

      // Handle orphans (children with missing parents)
      const processedSlugs = new Set(sortedLessons.map((l) => l.slug))
      const orphans = lessons.filter((l) => !processedSlugs.has(l.slug))
      if (orphans.length > 0) {
        orphans.sort((a, b) => a.order - b.order)
        sortedLessons.push(...orphans)
      }

      return {
        moduleSlug,
        lessons: sortedLessons,
      }
    },
  )

  return modules.sort((m1, m2) => m1.moduleSlug.localeCompare(m2.moduleSlug))
}

export async function getCourseModules(): Promise<Module[]> {
  return getModulesFromGlob(courseModulesGlob, '/content')
}

export async function getLibraryModules(): Promise<Module[]> {
  return getModulesFromGlob(libraryModulesGlob, '/library')
}

type LoadLessonContentResult = {
  frontmatter: Frontmatter
  content: string // raw content
  headings: { depth: number; text: string; id: string }[]
  Component: ComponentType
} | null

async function loadContent(
  moduleSlug: string,
  lessonSlug: string,
  modulesGlob: Record<string, MDXModule>,
  rawGlob: Record<string, any>, // rawGlob returns module with default export as string
  baseDir: string,
): Promise<LoadLessonContentResult> {
  // Construct path to match glob key
  // Note: import.meta.glob keys are absolute or relative depending on config, usually start with / if absolute pattern used
  const path = `${baseDir}/${moduleSlug}/${lessonSlug}.mdx`

  const mod = modulesGlob[path]
  const rawMod = rawGlob[path]

  if (!mod || !rawMod) {
    return null
  }

  const { frontmatter, default: Component } = mod
  const rawContent = rawMod.default

  const headings = await extractHeadings(rawContent)

  return {
    frontmatter,
    content: rawContent,
    headings,
    Component,
  }
}

export async function loadLessonContent(
  moduleSlug: string,
  lessonSlug: string,
): Promise<LoadLessonContentResult> {
  return loadContent(
    moduleSlug,
    lessonSlug,
    courseModulesGlob,
    courseRawGlob,
    '/content',
  )
}

// MDX component type that accepts a components prop
export type MDXComponent = ComponentType<{
  components?: Record<string, ComponentType<any>>
}>

// Get just the MDX component synchronously (for client-side rendering)
export function getLessonComponent(
  moduleSlug: string,
  lessonSlug: string,
): MDXComponent | null {
  const path = `/content/${moduleSlug}/${lessonSlug}.mdx`
  const mod = courseModulesGlob[path]
  return (mod?.default as MDXComponent) ?? null
}

export async function loadLibraryContent(
  moduleSlug: string,
  lessonSlug: string,
): Promise<LoadLessonContentResult> {
  return loadContent(
    moduleSlug,
    lessonSlug,
    libraryModulesGlob,
    libraryRawGlob,
    '/library',
  )
}

async function extractHeadings(mdxContent: string) {
  let headings: { depth: number; text: string; id: string }[] = []
  await remark()
    .use(remarkMdx)
    .use(() => (tree: Root) => {
      visit(tree, 'heading', (node: Heading) => {
        const text = toString(node)
        const id = slugify(text)
        headings.push({ depth: node.depth, text, id })
      })
    })
    .process(mdxContent)
  return headings
}
