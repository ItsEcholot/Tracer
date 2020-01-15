import React, { ReactNode } from 'react';
import Konva from 'konva';
import LayerList from '../../types/LayerList';
import ClientCapabilities from '../../types/ClientCapabilities';
import TransformService from '../../services/Transform';
import DrawService from '../../services/Draw';
import PointerService from '../../services/Pointer';
import CurrentForce from '../../types/CurrentForce';
import ClientCapabilitiesService from '../../services/ClientCapabilities';
import ToolModes from '../../types/ToolModes';

import styles from './styles.module.css';

interface KonvaCanvasProps {
  width: number;
  height: number;
  toolMode: ToolModes;
}

interface KonvaCanvasState {
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
  private disabledListeningShape: Konva.Shape | Konva.Stage | undefined;
  private currentForces: CurrentForce[] = [];

  constructor(props: KonvaCanvasProps) {
    super(props);
    this.state = {
      strokeColor: '#000000',
      strokeWidth: 4,
    };
  }

  public componentDidMount(): void {
    this.setupKonva();
  }

  public componentDidUpdate(prevProps: KonvaCanvasProps): void {
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      if (!this.stage) return;
      TransformService.changeStageSize(this.stage, this.props.width, this.props.height);
      DrawService.drawBGGrid(this.stage, this.layers.bgGrid);
    }
  }

  private onTouchStart(event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    if (!this.stage) return;
    if (this.props.toolMode === ToolModes.Write && this.clientCapabilities.pen) {
      if (event.target && event.target.hasName('shape')) {
        this.disabledListeningShape = event.target;
        this.disabledListeningShape.listening(false);
      }
      this.drawing = true;

      const pointerPos = PointerService.getStagePointerPosition(this.stage);
      if (this.clientCapabilities.force && (event.evt as TouchEvent).targetTouches) {
        this.currentForces = [{ pos: pointerPos, force: (event.evt as TouchEvent).targetTouches[0].force }];
      }
      this.currentLine = DrawService.startDrawing(this.stage, this.layers, this.state.strokeColor);
      this.layers.main.add(this.currentLine);
    } else {
      TransformService.startTransform(event.target, this.stage, this.layers);
    }
  }

  private onTouchEnd(): void {
    if (!this.currentLine || !this.stage || !this.drawing) return;
    DrawService.stopDrawing(this.currentLine, this.stage);
    if (this.disabledListeningShape) {
      this.disabledListeningShape.listening(true);
      this.disabledListeningShape = undefined;
    }
    this.currentForces = [];
    this.drawing = false;
    this.layers.main.batchDraw();
  }

  private onTouchMove(event: Konva.KonvaEventObject<TouchEvent | PointerEvent>): void {
    event.evt.preventDefault(); // Chrome on desktop would maybe otherwise think that we start a gesture
    if (!this.drawing || !this.stage || !this.currentLine) return;
    if (!this.clientCapabilities.force) return;

    const pointerPos = PointerService.getStagePointerPosition(this.stage);
    if (
      this.currentForces.length > 0 &&
      pointerPos.x === this.currentForces[this.currentForces.length - 1].pos.x &&
      pointerPos.y === this.currentForces[this.currentForces.length - 1].pos.y
    )
      return;
    if (this.clientCapabilities.force && (event.evt as TouchEvent).targetTouches) {
      this.currentForces.push({
        pos: pointerPos,
        force: Math.max((event.evt as TouchEvent).targetTouches[0].force, 0.1),
      });
    } else if (this.clientCapabilities.force && (event.evt as PointerEvent).pressure) {
      this.currentForces.push({ pos: pointerPos, force: Math.max((event.evt as PointerEvent).pressure, 0.1) });
    }
    DrawService.draw(this.currentLine, this.currentForces, this.state.strokeWidth);
  }

  private setupKonva(): void {
    if (this.containerRef.current) {
      this.stage = new Konva.Stage({
        container: this.containerRef.current,
        width: this.props.width,
        height: this.props.height,
        draggable: true,
        dragBoundFunc: (pos): Konva.Vector2d => TransformService.stageDragBoundFunc(pos, this.stage as Konva.Stage),
      });

      this.layers.bgGrid = new Konva.Layer({
        hitGraphEnabled: false,
      });
      this.layers.main = new Konva.Layer();
      this.stage.add(this.layers.bgGrid);
      this.stage.add(this.layers.main);

      this.stage.on('mousedown touchstart', this.onTouchStart.bind(this));
      this.stage.on('mouseup touchend touchcancel', this.onTouchEnd.bind(this));
      this.stage.on('touchmove', this.onTouchMove.bind(this));
      this.containerRef.current.addEventListener('pointerdown', event => {
        this.clientCapabilities = ClientCapabilitiesService.updateClientCapabilities(event, this.clientCapabilities);
      });
      this.containerRef.current.addEventListener('pointermove', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchMove({ evt: event } as Konva.KonvaEventObject<PointerEvent>);
      });
      document.addEventListener('stylusplugin-down', event => {
        this.clientCapabilities.pen = true;
        this.clientCapabilities.force = true;
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchStart({ evt: event } as Konva.KonvaEventObject<TouchEvent>);
      });
      document.addEventListener('stylusplugin-move', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchMove({ evt: event } as Konva.KonvaEventObject<TouchEvent>);
      });
      document.addEventListener('stylusplugin-up', () => {
        this.onTouchEnd();
      });
      this.stage.on('dragend', () => {
        if (!this.stage) return;
        DrawService.drawBGGrid(this.stage, this.layers.bgGrid);
      });

      const circle = new Konva.Circle({
        x: 250,
        y: 250,
        radius: 100,
        fill: 'black',
        name: 'userContent shape',
      });
      this.layers.main.add(circle);
      circle.draw();
    }
  }

  public render(): ReactNode {
    return <div className={styles.Container} ref={this.containerRef} />;
  }
}

export default KonvaCanvas;
