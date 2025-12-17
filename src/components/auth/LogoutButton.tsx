import { useRouter } from '@tanstack/react-router'
import { logoutFn } from '@/server/auth'
import { toast } from 'sonner'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutFn()
      toast.success('Logged out successfully')
      await router.invalidate()
      await router.navigate({ to: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <button onClick={handleLogout} className="w-full text-left">
      Logout
    </button>
  )
}
