import { useEffect, useState, useRef, MouseEvent, useLayoutEffect } from 'react'
import styles from './tableOfContents.module.css'
import { slugify } from '@/lib/utils'
import useScrollSpy from './hooks/useScrollSpy'

// Define the types for your props
interface Heading {
  id: string
  text: string
  depth: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

function TableOfContents({ headings }: TableOfContentsProps) {
  const [isVisible] = useState(true)
  const elementRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const updatedHeadings = headings.map((heading) => {
      const generatedId = heading.id || slugify(heading.text)

      return {
        ...heading,
        id: generatedId,
      }
    })

    elementRefs.current = updatedHeadings.map((heading) => {
      const elementId = slugify(heading.id)
      const element = document.getElementById(elementId)

      return element
    })
  }, [headings])

  const elements = elementRefs.current
  const activeIndex = useScrollSpy(elements.filter(Boolean) as HTMLElement[], {
    offset: 100,
    threshold: 0,
    rootMargin: '0px 0px 0px 0px',
  })

  useLayoutEffect(() => {
    const updatedHeadings = headings.map((heading) => {
      const generatedId = heading.id || slugify(heading.text)
      return {
        ...heading,
        id: generatedId,
      }
    })

    elementRefs.current = updatedHeadings.map((heading) => {
      const elementId = heading.id // Use the ID directly
      const element = document.getElementById(elementId)
      // Log each search
      return element
    })
  }, [headings])

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault()

    const targetElement = document.getElementById(id)
    if (targetElement) {
      const offset = 0 // Height of the fixed header or other offset
      const elementTop =
        window.scrollY + targetElement.getBoundingClientRect().top
      const offsetPosition = elementTop - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth', // Smooth scroll
      })
    } else {
      console.error('Element not found for ID:', id)
    }
  }

  return (
    <aside className={`${styles.sidenav} text-sm`}>
      <div className={`${styles.sidenav_contents} flex flex-col`}>
        <nav className="rounded-lg">
          <ul>
            {headings.map((heading, index) => {
              const slugifiedId = slugify(heading.id || heading.text)

              return (
                <li
                  key={index}
                  className={`${styles.tocItem} ${
                    isVisible ? styles.fadeIn : ''
                  } ${
                    index === activeIndex ? 'text-yellow-600' : ''
                  } hover:bg-[var(--text-color-primary-300)] text-[var(--text-color-primary-800)] rounded-lg transition-colors duration-300 ease-in-out`}
                  style={{
                    marginLeft: `${heading.depth - 2}em`,
                    lineHeight: 1.5,
                    letterSpacing: '0.3px',
                    paddingTop: `${heading.depth === 2 ? '10px' : '8px'}`,
                    paddingBottom: `${heading.depth === 2 ? '10px' : '8px'}`,
                    paddingLeft: `${heading.depth === 2 ? '3px' : '1px'}`,
                    animationDelay: `${0.5 + index * 0.5}s`,
                  }}
                >
                  <a
                    href={`#${slugifiedId}`}
                    onClick={(e) => {
                      handleClick(e, slugifiedId)
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default TableOfContents
