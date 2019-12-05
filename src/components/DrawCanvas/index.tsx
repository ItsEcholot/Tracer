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

  public componentWillUnmount(): void {
    document.removeEventListener('mouseup', this.onMouseUpDocument.bind(this));
  }

  private onMouseUpDocument(): void {
    if (this.state.drawing) {
      this.stopDrawing();
    }
  }

  private onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    if (!this.state.drawing) {
      this.updateLastPos(event.clientX, event.clientY, event.target);
      this.startDrawing();
    }
  }

  private onTouchStart(event: React.TouchEvent<HTMLCanvasElement>): void {
    if (!this.state.drawing) {
      this.updateLastPosTouch(event);
      this.startDrawing();
    }
  }

  private onMouseUp(): void {
    if (this.state.drawing) {
      this.stopDrawing();
    }
  }

  private onTouchEnd(event: React.TouchEvent<HTMLCanvasElement>): void {
    if (this.state.drawing) {
      this.stopDrawing();
    }
  }

  private onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    this.draw(event.clientX, event.clientY, event.target);
  }

  private onTouchMove(event: React.TouchEvent<HTMLCanvasElement>): void {
    const touch = event.targetTouches.item(0);
    this.draw(touch.clientX, touch.clientY, event.target);
  }

  private onMouseEnter(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    const relPos = this.calculateRelativePos(event.clientX, event.clientY, event.target);
    if (relPos.x < 6 || relPos.y < 6 || relPos.x > this.props.width - 6 || relPos.y > this.props.height - 6) {
      if (event.buttons === 1 && !this.state.drawing) {
        this.updateLastPos(event.clientX, event.clientY, event.target);
        this.startDrawing();
      } else {
        this.updateLastPos(event.clientX, event.clientY, event.target);
      }
    }
  }

  private draw(x: number, y: number, target: EventTarget): void {
    if (this.state.drawing && this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.lineWidth = 3;
      this.canvasContext.lineCap = 'round';
      this.canvasContext.strokeStyle = '#000000';

      this.canvasContext.moveTo(this.lastPosX, this.lastPosY);
      this.updateLastPos(x, y, target);
      this.canvasContext.lineTo(this.lastPosX, this.lastPosY);
      this.canvasContext.stroke();
    }
  }

  private updateLastPos(x: number, y: number, target: EventTarget): void {
    const relPos = this.calculateRelativePos(x, y, target);
    this.lastPosX = relPos.x;
    this.lastPosY = relPos.y;
  }

  private updateLastPosTouch(event: React.TouchEvent<HTMLCanvasElement>): void {
    const relPos = this.calculateRelativePos(
      event.touches.item(0).clientX,
      event.touches.item(0).clientY,
      event.target,
    );
    this.lastPosX = relPos.x;
    this.lastPosY = relPos.y;
  }

  private calculateRelativePos(x: number, y: number, target: any): { x: number; y: number } {
    const rect = target.getBoundingClientRect();
    return {
      x: x - rect.left,
      y: y - rect.top,
    };
  }

  private startDrawing(): void {
    this.setState({ drawing: true });
  }

  private stopDrawing(): void {
    this.setState({ drawing: false });
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
        onMouseEnter={this.onMouseEnter.bind(this)}
        onTouchStart={this.onTouchStart.bind(this)}
        onTouchMove={this.onTouchMove.bind(this)}
        onTouchEnd={this.onTouchEnd.bind(this)}
        ref={this.canvasRef}
        id="drawCanvas"
      />
    );
  }
}

export default DrawCanvas;
