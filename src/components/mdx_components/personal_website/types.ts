export interface Step {
  id: number
  title: string
  description: string
  url?: string
  command?: string
  icon: string
  benefits: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
