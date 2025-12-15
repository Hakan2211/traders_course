import { useRouter } from '@tanstack/react-router'

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    // TODO: Implement actual logout logic when auth is added back
    console.log('Logout clicked - Auth implementation pending')
    // For now, just redirect to home
    await router.invalidate()
    await router.navigate({ to: '/' })
  }
  return (
    <button onClick={handleLogout} className="w-full text-left">
      Logout
    </button>
  )
}
