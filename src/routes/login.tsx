import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { loginFn } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null)
        await loginFn({ data: value })
        toast.success('Logged in successfully')
        router.navigate({ to: '/' })
      } catch (err) {
        setError((err as Error).message)
        toast.error('Failed to login')
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#B0811C]">
            Sign In
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            <form.Field
              name="email"
              validators={{
                onChange: z.string().email('Invalid email address'),
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:ring-[#B0811C] focus:border-[#B0811C]"
                    placeholder="m@example.com"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="password"
              validators={{
                onChange: z.string().min(1, 'Password is required'),
              }}
              children={(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name}>Password</Label>
                    <Link
                      to="/"
                      className="text-xs text-[#B0811C] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:ring-[#B0811C] focus:border-[#B0811C]"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-xs text-red-500">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#B0811C] hover:bg-[#9a7019] text-black font-semibold"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#B0811C] hover:underline">
                Enroll Now
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
