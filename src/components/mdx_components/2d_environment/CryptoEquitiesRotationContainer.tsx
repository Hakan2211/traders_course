import React from 'react'
import dynamic from '@/lib/dynamic'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'

const CryptoEquitiesRotation = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/CryptoEquitiesRotation'),
  { ssr: false },
)

const CryptoEquitiesRotationContainer: React.FC = () => {
  return (
    <EnvironmentWrapper height="800px">
      <CryptoEquitiesRotation />
    </EnvironmentWrapper>
  )
}

export default CryptoEquitiesRotationContainer
