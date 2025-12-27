import { Step } from './types'

export const steps: Step[] = [
  {
    id: 1,
    title: 'Create GitHub Account',
    description:
      "Your blog's code needs a home. GitHub is the industry standard for hosting code repositories.",
    url: 'https://github.com/join',
    icon: 'fa-brands fa-github',
    benefits: ['Free hosting', 'Version control', 'Developer standard'],
  },
  {
    id: 2,
    title: 'Create Repository',
    description:
      'Create a new repository to store your blog. Name it something like "my-trading-blog".',
    url: 'https://github.com/new',
    icon: 'fa-solid fa-folder-plus',
    benefits: ['Organized code', 'Collaboration ready', 'Backup included'],
  },
  {
    id: 3,
    title: 'Setup Keystatic Cloud',
    description:
      'Go to keystatic.cloud, sign up, create a team, and create a project to connect your repository.',
    url: 'https://keystatic.cloud',
    icon: 'fa-solid fa-cloud',
    benefits: ['Visual editor', 'GitHub integration', 'No CLI needed'],
  },
  {
    id: 4,
    title: 'Deploy to Vercel',
    description:
      'Vercel gives you a live URL for your blog instantly. Connect it to your GitHub repo.',
    url: 'https://vercel.com/new',
    icon: 'fa-solid fa-rocket',
    benefits: ['Global CDN', 'Instant rollback', 'Free SSL'],
  },
  {
    id: 5,
    title: 'Write First Post',
    description: 'Open your Admin Panel and write your first post.',
    url: 'https://your-website.com/keystatic',
    icon: 'fa-solid fa-newspaper',
    benefits: ['Visual editor', 'GitHub integration', 'No CLI needed'],
  },
]
