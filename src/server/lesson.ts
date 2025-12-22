import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import type { Heading, Root } from 'mdast'
import { slugify } from '@/lib/utils'

const GetHeadingsSchema = z.object({
  moduleSlug: z.string(),
  lessonSlug: z.string(),
  baseDir: z.string().default('/content'),
})

async function extractHeadings(mdxContent: string) {
  // Remove YAML frontmatter before parsing (content between --- delimiters at the start)
  let contentWithoutFrontmatter = mdxContent
  const frontmatterMatch = mdxContent.match(/^---\n[\s\S]*?\n---\n/)
  if (frontmatterMatch) {
    contentWithoutFrontmatter = mdxContent.slice(frontmatterMatch[0].length)
  }

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
    .process(contentWithoutFrontmatter)
  return headings
}

export const getHeadingsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => {
    if (typeof data !== 'object' || data === null) {
      return { moduleSlug: '', lessonSlug: '', baseDir: '/content' }
    }
    return GetHeadingsSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const { moduleSlug, lessonSlug, baseDir } = data

    const filePath = path.join(
      process.cwd(),
      `${baseDir}/${moduleSlug}/${lessonSlug}.mdx`,
    )

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8')
      const headings = await extractHeadings(rawContent)
      return { headings }
    } catch (err) {
      console.error('[getHeadingsFn] Failed to read file:', filePath, err)
      return { headings: [] }
    }
  })
