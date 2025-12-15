import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CustomLinkProps {
  href: string
  children: ReactNode
  className?: string
  external?: boolean // Optional prop to force external/internal behavior
  target?: string
  rel?: string
  [key: string]: any // Allow other props to pass through
}

/**
 * CustomLink component that automatically handles both external and internal links.
 *
 * - External links (http://, https://, mailto:, tel:) use a regular <a> tag
 * - Internal links use Next.js Link component for client-side navigation
 * - Can be overridden with the `external` prop
 *
 * @example
 * <CustomLink href="https://example.com">External Link</CustomLink>
 * <CustomLink href="/course/module1/lesson1">Internal Link</CustomLink>
 * <CustomLink href="/some-page" external>Force external behavior</CustomLink>
 */
export function CustomLink({
  href,
  children,
  className,
  external,
  target,
  rel,
  ...props
}: CustomLinkProps) {
  // Determine if link is external
  const isExternal =
    external !== undefined
      ? external
      : href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')

  // Default external link attributes
  const externalProps = {
    target: target || '_blank',
    rel: rel || 'noopener noreferrer',
  }

  const baseClassName = cn(
    'text-primary underline-offset-4 hover:underline',
    className,
  )

  if (isExternal) {
    return (
      <a href={href} className={baseClassName} {...externalProps} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link to={href} className={baseClassName} {...props}>
      {children}
    </Link>
  )
}
