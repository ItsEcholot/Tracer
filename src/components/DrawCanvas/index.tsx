import React from 'react';
import styles from './styles.module.css';

interface DrawCanvasProps {
  width: number;
  height: number;
}

interface DrawCanvasState {
  drawing: boolean;
}

class DrawCanvas extends React.PureComponent<DrawCanvasProps, DrawCanvasState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private canvasContext: CanvasRenderingContext2D | undefined | null;
  private lastPosX = 0;
  private lastPosY = 0;

  constructor(props: DrawCanvasProps) {
    super(props);
    this.state = {
      drawing: false,
    };
  }

  public componentDidMount(): void {
    document.addEventListener('mouseup', this.onMouseUpDocument.bind(this));
    if (this.canvasRef.current) {
      this.canvasContext = this.canvasRef.current.getContext('2d');
    }
  }

  private onMouseUpDocument(): void {
    if (this.state.drawing) {
      this.stopDrawing();
    }
  }

  private onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    if (!this.state.drawing) {
      this.updateLastPos(event);
      this.startDrawing();
    }
  }

  private onMouseUp(): void {
    if (this.state.drawing) {
      this.stopDrawing();
    }
  }

  private onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    if (this.state.drawing && this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.lineWidth = 3;
      this.canvasContext.lineCap = 'round';
      this.canvasContext.strokeStyle = '#000000';

      this.canvasContext.moveTo(this.lastPosX, this.lastPosY);
      this.updateLastPos(event);
      this.canvasContext.lineTo(this.lastPosX, this.lastPosY);
      this.canvasContext.stroke();
    }
  }

  private onMouseLeave(): void {}

  private onMouseEnter(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    if (event.buttons === 0 && this.state.drawing) {
      this.stopDrawing();
    } else {
      this.updateLastPos(event);
    }
  }

  private updateLastPos(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    const rect = (event.target as any).getBoundingClientRect();
    this.lastPosX = event.clientX - rect.left;
    this.lastPosY = event.clientY - rect.top;
  }

  private startDrawing(): void {
    this.setState({ drawing: true });
    console.log('start drawing');
  }

  private stopDrawing(): void {
    this.setState({ drawing: false });
    console.log('stop drawing');
  }

  public render(): React.ReactNode {
    return (
      <canvas
        className={styles.Canvas}
        width={this.props.width}
        height={this.props.height}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseEnter={this.onMouseEnter.bind(this)}
        ref={this.canvasRef}
      />
    );
  }
}

export default DrawCanvas;
