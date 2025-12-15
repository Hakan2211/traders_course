
import { useCreateStore } from 'leva';
import { CanvasWrapper } from '@/components/mdx_components/canvas3d/canvasWrapper';
import CompanyGalaxy3D from './CompanyGalaxy3D';

const CompanyGalaxyContainer = () => {
  const levaStore = useCreateStore();
  return (
    <div className="w-full my-10">
      <CanvasWrapper
        enableEnvironment={true}
        enableControls={false}
        height="640px"
        cameraSettings={{
          position: [8, 4.5, 15],
          fov: 55,
        }}
      >
        <CompanyGalaxy3D levaStore={levaStore} />
      </CanvasWrapper>
    </div>
  );
};

export default CompanyGalaxyContainer;
