import { useCallback } from 'react'
import EnvironmentWrapper from '@/components/mdx_components/2d_environment/environmentWrapper'
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer'
import type p5 from 'p5'

const ChartPlane2D = () => {
  // Edge color matching the 3D component
  const edgeColor = '#00d4ff' // Neon blue

  const sketch = useCallback((p: p5, parentEl: HTMLDivElement) => {
    let texture: p5.Image | undefined

    p.setup = () => {
      const canvas = p.createCanvas(parentEl.clientWidth, parentEl.clientHeight)
      canvas.style('display', 'block')

      // Load the image asynchronously
      p.loadImage('/textures/earth_texture.jpg', (img) => {
        texture = img
      })
    }

    p.draw = () => {
      // Clear background
      p.background(19, 26, 38) // Match the 3D background color

      if (texture) {
        // Calculate dimensions to maintain aspect ratio and fit with padding
        const padding = 20
        const maxWidth = p.width - padding * 2
        const maxHeight = p.height - padding * 2

        const textureAspect = texture.width / texture.height
        const canvasAspect = maxWidth / maxHeight

        let drawWidth: number
        let drawHeight: number

        if (textureAspect > canvasAspect) {
          // Texture is wider
          drawWidth = maxWidth
          drawHeight = maxWidth / textureAspect
        } else {
          // Texture is taller
          drawHeight = maxHeight
          drawWidth = maxHeight * textureAspect
        }

        const x = (p.width - drawWidth) / 2
        const y = (p.height - drawHeight) / 2

        // Draw the texture
        p.image(texture, x, y, drawWidth, drawHeight)

        // Draw border matching the 3D edge color
        p.stroke(edgeColor)
        p.strokeWeight(3)
        p.noFill()
        p.rect(x - 2, y - 2, drawWidth + 4, drawHeight + 4)
      }
    }

    p.windowResized = () => {
      p.resizeCanvas(parentEl.clientWidth, parentEl.clientHeight)
    }
  }, [])

  return (
    <EnvironmentWrapper height="400px">
      <P5Sketch sketch={sketch} />
    </EnvironmentWrapper>
  )
}

export default ChartPlane2D
