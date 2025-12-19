import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ProgressProvider } from '../context/progress/ProgressContext'
import { Toaster } from 'sonner'
import { DARK_TOKENS, LIGHT_TOKENS } from '@/lib/constants'
import '@fontsource/geist-sans'
import '@fontsource/geist-mono'
import appCss from '../globals.css?url'
import { getAuthSessionFn } from '@/server/auth'
import { NotFound } from '@/components/NotFound'

export const Route = createRootRoute({
  loader: async () => {
    const session = await getAuthSessionFn()
    return { session }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Course For Traders | Master the Markets',
      },
      {
        name: 'description',
        content:
          'Master technical analysis, risk management, and trading psychology with the Market Magic Box analogy. A comprehensive course for serious traders.',
      },
      {
        property: 'og:title',
        content: 'Course For Traders | Master the Markets',
      },
      {
        property: 'og:description',
        content:
          'Master technical analysis, risk management, and trading psychology with the Market Magic Box strategy. A comprehensive course for serious traders.',
      },
      {
        property: 'og:image',
        content: '/images/hero_module1.jpg',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Market Magic Box | Learn Through Physics',
      },
      {
        name: 'twitter:description',
        content:
          'Master technical analysis, risk management, and trading psychology with the Market Magic Box analogy.',
      },
      {
        name: 'twitter:image',
        content: '/images/hero_module1.jpg',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  const theme = 'dark'

  return (
    <html
      lang="en"
      className={theme}
      style={
        theme === 'dark'
          ? (DARK_TOKENS as React.CSSProperties)
          : (LIGHT_TOKENS as React.CSSProperties)
      }
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ProgressProvider>
          <Outlet />
          <Toaster richColors position="top-center" />
        </ProgressProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
