declare module 'react-p5' {
  import P5 from 'p5';
  import { Component } from 'react';

  export interface SketchProps {
    setup?: (p5: P5, canvasParentRef: Element) => void;
    draw?: (p5: P5) => void;
    windowResized?: (p5: P5) => void;
    preload?: (p5: P5) => void;
    mouseClicked?: (p5: P5) => void;
    mousePressed?: (p5: P5) => void;
    mouseReleased?: (p5: P5) => void;
    mouseDragged?: (p5: P5) => void;
    mouseMoved?: (p5: P5) => void;
    mouseEntered?: (p5: P5) => void;
    mouseExited?: (p5: P5) => void;
    mouseWheel?: (p5: P5) => void;
    touchStarted?: (p5: P5) => void;
    touchMoved?: (p5: P5) => void;
    touchEnded?: (p5: P5) => void;
    keyTyped?: (p5: P5) => void;
    keyPressed?: (p5: P5) => void;
    keyReleased?: (p5: P5) => void;
    [key: string]: any;
  }

  export default class Sketch extends Component<SketchProps> {}
}
