import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/course/library')({
  component: LibraryLayout,
})

function LibraryLayout() {
  return <Outlet />
}
