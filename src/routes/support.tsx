import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail, Twitter, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/support')({
  component: SupportComponent,
})

function SupportComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#B0811C]">
            Support
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Need help? Reach out to us through the following channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="p-2 bg-[#B0811C]/10 rounded-full">
              <Mail className="w-6 h-6 text-[#B0811C]" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Email Us</p>
              <a
                href="mailto:hbilgic1992@gmail.com"
                className="text-lg font-semibold text-zinc-100 hover:text-[#B0811C] transition-colors"
              >
                hbilgic1992@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="p-2 bg-[#B0811C]/10 rounded-full">
              <Twitter className="w-6 h-6 text-[#B0811C]" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Twitter / X</p>
              <a
                href="https://twitter.com/hakanbilgo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-zinc-100 hover:text-[#B0811C] transition-colors"
              >
                @hakanbilgo
              </a>
            </div>
          </div>
          <div className="pt-4 flex justify-center">
            <Link
              to="/course"
              className="flex items-center text-sm text-zinc-400 hover:text-[#B0811C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
