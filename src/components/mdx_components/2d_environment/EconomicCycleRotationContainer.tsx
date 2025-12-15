import React from 'react'
import dynamic from '@/lib/dynamic'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'

const EconomicCycleRotation = dynamic(() => import('./EconomicCycleRotation'), {
  ssr: false,
})

const EconomicCycleRotationContainer: React.FC = () => {
  return (
    <EnvironmentWrapper height="900px">
      <EconomicCycleRotation />
    </EnvironmentWrapper>
  )
}

export default EconomicCycleRotationContainer
