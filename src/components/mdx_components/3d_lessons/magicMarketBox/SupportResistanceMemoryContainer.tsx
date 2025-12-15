import React from 'react'
import dynamic from '@/lib/dynamic'
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper'
import { useCreateStore } from 'leva'

const SupportResistanceMemory3D = dynamic(
  () =>
    import('@/components/mdx_components/3d_lessons/magicMarketBox/SupportResistanceMemory3D'),
  { ssr: false },
)

const SupportResistanceMemoryContainer: React.FC = () => {
  const levaStore = useCreateStore()

  return (
    <div className="w-full my-8">
      <div className="w-full flex flex-col gap-4">
        {/* Heading */}
        <div className="px-2">
          <h3 className="text-base md:text-lg font-semibold text-white">
            Memory Reactivates — Support/Resistance (3D)
          </h3>
          <p className="text-sm text-muted-foreground">
            The active box approaches a memory zone — watch the reaction.
          </p>
        </div>
        {/* 3D Scene only */}
        <CanvasWrapper
          enableEnvironment={false}
          enableControls={true}
          height="540px"
          cameraSettings={{
            position: [0, -2, 20],
            fov: 50,
            near: 0.1,
            far: 100,
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 6]} intensity={0.9} />
          <SupportResistanceMemory3D levaStore={levaStore} />
        </CanvasWrapper>
      </div>
    </div>
  )
}

export default SupportResistanceMemoryContainer
