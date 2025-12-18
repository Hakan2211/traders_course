import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'

// Trigger restart
const config = defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    }),
    devtools(),
    nitro({
      rollupConfig: {
        external: [],
      },
      externals: {
        inline: ['zod'],
      },
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  build: {
    // Increase chunk size warning limit (some chunks will be large)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks to split large dependencies and reduce memory pressure
        manualChunks: (id) => {
          // Three.js ecosystem - very large, keep separate
          if (id.includes('node_modules/three')) {
            return 'vendor-three'
          }
          if (id.includes('node_modules/@react-three')) {
            return 'vendor-react-three'
          }
          // Recharts - large charting library
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3')
          ) {
            return 'vendor-charts'
          }
          // Framer Motion - animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          // TanStack libraries
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-tanstack'
          }
          // React core
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})

export default config
