import React, { ReactNode } from 'react';
import Konva from 'konva';
import LayerList from '../../types/LayerList';
import ClientCapabilities from '../../types/ClientCapabilities';
import TransformService from '../../services/Transform';
import styles from './styles.module.css';
import DrawService from '../../services/Draw';

interface KonvaCanvasProps {
  width: number;
  height: number;
}

interface KonvaCanvasState {
  debug: any;
  strokeColor: string;
  strokeWidth: number;
}

class KonvaCanvas extends React.PureComponent<KonvaCanvasProps, KonvaCanvasState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private stage: Konva.Stage | undefined;
  private layers: LayerList = {};
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
    if (!this.stage) return;
    if (this.clientCapabilities.pen) {
      TransformService.stopTransform(this.stage, this.layers);
      this.drawing = true;
      this.currentLine = DrawService.startDrawing(
        this.stage,
        this.layers,
        this.state.strokeColor,
        this.state.strokeWidth,
      );
    } else {
      TransformService.startTransform(event.target, this.stage, this.layers);
    }
  }

  private onTouchEnd(): void {
    if (!this.currentLine || !this.stage) return;
    DrawService.stopDrawing(this.currentLine, this.stage, this.clientCapabilities);
    this.drawing = false;
  }

  private onTouchMove(): void {
    if (!this.drawing || !this.stage || !this.currentLine) return;
    DrawService.draw(this.currentLine, this.stage);
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
