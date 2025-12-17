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
        title: 'Course Platform',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
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
