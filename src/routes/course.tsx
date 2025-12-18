import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuthSessionFn } from '@/server/auth'

export const Route = createFileRoute('/course')({
  beforeLoad: async ({ location }) => {
    const session = await getAuthSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    // Allow admins or active subscribers
    const isEnrolled =
      session.user.role === 'ADMIN' ||
      session.user.stripeSubscriptionStatus === 'active'

    if (!isEnrolled) {
      throw redirect({
        to: '/',
        search: {
          error: 'not-enrolled',
        },
      })
    }
  },
  component: CourseLayout,
})

function CourseLayout() {
  return <Outlet />
}
