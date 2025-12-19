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
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Manual chunks to split large dependencies and reduce memory pressure
        // Note: Be careful with libraries that have internal circular dependencies
        manualChunks: (id) => {
          // Three.js ecosystem - very large, keep separate
          if (id.includes('node_modules/three')) {
            return 'vendor-three'
          }
          if (id.includes('node_modules/@react-three')) {
            return 'vendor-react-three'
          }
          // Framer Motion - animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          // Note: Removed recharts/d3 and radix-ui from manual chunks
          // These libraries have internal circular dependencies that break
          // when forcefully split into separate chunks
        },
      },
    },
  },
})

export default config
