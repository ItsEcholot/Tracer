import React, { ReactNode } from 'react';
import Konva from 'konva';
import styles from './styles.module.css';

interface KonvaCanvasProps {
  width: number;
  height: number;
}

interface KonvaCanvasState {
  debug: any;
  strokeColor: string;
  strokeWidth: number;
}

interface ClientCapabilities {
  force: boolean;
  pen: boolean;
}

class KonvaCanvas extends React.PureComponent<KonvaCanvasProps, KonvaCanvasState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private stage: Konva.Stage | undefined;
  private layers: { [key: string]: Konva.Layer } = {};
  private clientCapabilities: ClientCapabilities = {
    force: false,
    pen: false,
  };
  private drawing = false;
  private currentLine: Konva.Line | undefined;

  constructor(props: KonvaCanvasProps) {
    super(props);
    this.state = {
      debug: '-',
      strokeColor: '#000000',
      strokeWidth: 4,
    };
  }

  public componentDidMount(): void {
    this.setupKonva();
  }

  public componentDidUpdate(prevProps: KonvaCanvasProps): void {
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.changeKonvaStageSize(this.props.width, this.props.height);
    }
  }

  private onTouchStart(event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    this.updateClientCapabilities(event.evt);
    if (this.clientCapabilities.pen) {
      this.stopTransform(event.target);
      this.startDrawing();
    } else {
      this.startTransform(event.target);
    }
  }

  private onTouchEnd(): void {
    this.stopDrawing();
  }

  private onTouchMove(): void {
    if (!this.drawing || !this.stage) {
      return;
    }
    this.draw();
  }

  private getStagePointerPosition(): Konva.Vector2d | undefined {
    if (!this.stage) return;
    const pointerPos = this.stage.getPointerPosition();
    if (!pointerPos) return;
    const stageAbsolutePos = this.stage.getAbsolutePosition();
    stageAbsolutePos.x *= -1;
    stageAbsolutePos.y *= -1;

    pointerPos.x += stageAbsolutePos.x;
    pointerPos.y += stageAbsolutePos.y;
    return pointerPos;
  }

  private setupKonva(): void {
    if (this.containerRef.current) {
      this.stage = new Konva.Stage({
        container: this.containerRef.current,
        width: this.props.width,
        height: this.props.height,
        draggable: true,
        dragBoundFunc: this.stageDragBoundFunc.bind(this),
      });

      this.layers.main = new Konva.Layer();
      this.stage.add(this.layers.main);
      this.layers.main.batchDraw();

      this.stage.on('mousedown touchstart', this.onTouchStart.bind(this));
      this.stage.on('mouseup touchend', this.onTouchEnd.bind(this));
      this.stage.on('mousemove touchmove', this.onTouchMove.bind(this));

      const circle = new Konva.Circle({
        x: 0,
        y: 0,
        radius: 100,
        fill: 'black',
        name: 'userContent',
      });
      this.layers.main.add(circle);
      const circle2 = new Konva.Circle({
        x: 500,
        y: 500,
        radius: 100,
        fill: 'black',
        name: 'userContent',
      });
      this.layers.main.add(circle2);
      this.layers.main.batchDraw();
    }
  }

  private startDrawing(): void {
    if (!this.stage) return;
    this.stage.draggable(false);
    const pointerPos = this.getStagePointerPosition();
    if (!pointerPos) return;

    this.drawing = true;

    this.currentLine = new Konva.Line({
      stroke: this.state.strokeColor,
      strokeWidth: this.state.strokeWidth,
      points: [pointerPos.x, pointerPos.y],
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.4,
      name: 'userContent',
    });
    this.layers.main.add(this.currentLine);
  }

  private startTransform(target: Konva.Shape | Konva.Stage): void {
    if (target === this.stage) {
      this.stopTransform(target);
      return;
    }
    if (!target.hasName('userContent')) {
      return;
    }

    if (!this.stage) return;
    (this.stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      padding: 10,
      anchorSize: 20,
    });
    this.layers.main.add(transformer);
    transformer.attachTo(target);
    this.layers.main.draw();
  }

  private stopTransform(target: Konva.Shape | Konva.Stage): void {
    if (!this.stage) return;
    this.stage.find('Transformer').each((child: Konva.Node) => {
      const transformer = child as Konva.Transformer;
      transformer.getNode().draggable(false);
      transformer.destroy();
    });
    this.layers.main.draw();
  }

  private stopDrawing(): void {
    if (!this.stage) return;
    // Draw additional point where touch ended (for dots especially)
    if (this.clientCapabilities.pen) {
      if (!this.currentLine) return;
      const pointerPos = this.getStagePointerPosition();
      if (!pointerPos) return;
      this.currentLine.points([...this.currentLine.points(), pointerPos.x, pointerPos.y]);
      this.currentLine.draw();
    }

    this.stage.draggable(true);
    this.drawing = false;
  }

  private draw(): void {
    if (!this.stage || !this.currentLine) return;
    const pointerPos = this.getStagePointerPosition();
    if (!pointerPos) return;
    const oldPoints = this.currentLine.points();
    this.currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);
    this.currentLine.draw();
  }

  private updateClientCapabilities(event: MouseEvent | TouchEvent): void {
    if (window.TouchEvent && event instanceof TouchEvent) {
      if (event.targetTouches[0].force) {
        this.clientCapabilities.force = true;
      }
      this.clientCapabilities.pen = event.targetTouches[0].rotationAngle !== 0;
    }
  }

  private stageDragBoundFunc(pos: Konva.Vector2d): Konva.Vector2d {
    return {
      x: pos.x < 0 ? pos.x : (this.stage as any).absolutePosition().x,
      y: pos.y < 0 ? pos.y : (this.stage as any).absolutePosition().y,
    };
  }

  private changeKonvaStageSize(width: number, height: number): void {
    if (this.stage) {
      this.stage.width(width);
      this.stage.height(height);
      this.stage.batchDraw();
    }
  }

  public render(): ReactNode {
    return (
      <>
        <h3 className={styles.Debug}>{JSON.stringify(this.state.debug)}</h3>
        <div className={styles.Container} ref={this.containerRef} />
      </>
    );
  }
}

export default KonvaCanvas;
