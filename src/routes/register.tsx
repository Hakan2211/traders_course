import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { registerFn } from '@/server/auth'
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

export const Route = createFileRoute('/register')({
  component: RegisterComponent,
})

function RegisterComponent() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      username: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: z
        .object({
          email: z.string().email('Invalid email address'),
          username: z.string().min(3, 'Username must be at least 3 characters'),
          name: z.string().min(1, 'Name is required'),
          password: z.string().min(8, 'Password must be at least 8 characters'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword'],
        }),
    },
    onSubmit: async ({ value }) => {
      try {
        setError(null)
        await registerFn({
          data: {
            email: value.email,
            password: value.password,
            name: value.name,
            username: value.username,
          },
        })
        toast.success('Account created successfully')
        router.navigate({ to: '/' })
      } catch (err) {
        setError((err as Error).message)
        toast.error('Failed to create account')
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#B0811C]">
            Create Account
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your details to create your account
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
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:ring-[#B0811C] focus:border-[#B0811C]"
                    placeholder="John Doe"
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
              name="username"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Username</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:ring-[#B0811C] focus:border-[#B0811C]"
                    placeholder="johndoe"
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
              name="email"
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
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
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

            <form.Field
              name="confirmPassword"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm Password</Label>
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
              {form.state.isSubmitting ? 'Creating Account...' : 'Enroll Now'}
            </Button>

            <div className="text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#B0811C] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
