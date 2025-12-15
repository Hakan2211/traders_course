import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  ComponentType,
} from 'react'

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? <>{children}</> : null
}

interface DynamicOptions {
  ssr?: boolean
  loading?: ComponentType
}

export default function dynamic<T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  options: DynamicOptions = {},
) {
  const LazyComponent = lazy(async () => {
    const loaded = await importFn()
    // If it has a default export, return it as is (Module)
    if (loaded && typeof loaded === 'object' && 'default' in loaded) {
      return loaded
    }
    // Otherwise assume loaded is the component (from .then(mod => mod.Comp))
    return { default: loaded }
  })

  return function DynamicComponent(props: React.ComponentProps<T>) {
    const content = (
      <Suspense fallback={options.loading ? <options.loading /> : null}>
        <LazyComponent {...props} />
      </Suspense>
    )

    if (options.ssr === false) {
      return <ClientOnly>{content}</ClientOnly>
    }
    return content
  }
}
