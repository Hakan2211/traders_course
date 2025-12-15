import { useCreateStore } from 'leva'
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper'
import DilutionBuyback3D from './DilutionBuyback3D'

const DilutionBuybackContainer = () => {
  const levaStore = useCreateStore()

  return (
    <div className="w-full my-8">
      <CanvasWrapper
        enableEnvironment={false}
        enableControls={true}
        height="620px"
        cameraSettings={{
          position: [10, 6, 10],
          fov: 45,
        }}
      >
        <DilutionBuyback3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  )
}

export default DilutionBuybackContainer
