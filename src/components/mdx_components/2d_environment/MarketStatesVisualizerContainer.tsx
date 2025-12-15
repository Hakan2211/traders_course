import React from 'react'
import dynamic from '@/lib/dynamic'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'

const MarketStatesVisualizer = dynamic(
  () =>
    import('@/components/mdx_components/2d_environment/MarketStatesVisualizer'),
  { ssr: false },
)

const MarketStatesVisualizerContainer: React.FC = () => {
  return (
    <EnvironmentWrapper height="1050px">
      <MarketStatesVisualizer />
    </EnvironmentWrapper>
  )
}

export default MarketStatesVisualizerContainer
