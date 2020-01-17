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
    event.evt.preventDefault();
    if (!this.stage) return;
    if (this.clientCapabilities.pen) {
      if (event.target && event.target.hasName('shape')) {
        this.disabledListeningShape = event.target;
        this.disabledListeningShape.listening(false);
      }
      this.drawing = true;

      if (this.props.toolMode === ToolModes.Draw) {
        const pointerPos = PointerService.getStagePointerPosition(this.stage);
        if (this.clientCapabilities.force && (event.evt as TouchEvent).targetTouches) {
          this.currentForces = [{ pos: pointerPos, force: (event.evt as TouchEvent).targetTouches[0].force }];
        }
        this.currentLine = DrawService.startDrawing(this.stage, this.layers, this.state.strokeColor);
        this.layers.main.add(this.currentLine);
      } else if (this.props.toolMode === ToolModes.Select) {
        this.currentLine = DrawService.startSelecting(this.stage, this.layers);
        this.layers.selecting.add(this.currentLine);
      }
    } else if (event.target === this.stage) {
      TransformService.stopTransform(this.stage, this.layers);
    } else {
      TransformService.startTransform(event.target, this.stage, this.layers);
    }
  }

  private onTouchEnd(event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    event.evt.preventDefault();
    if (!this.stage) return;
    if (!this.drawing) {
      // TODO: Bad code
      TransformService.pinchToZoomEnd(this.stage, this.layers);
      DrawService.drawBGGrid(this.stage, this.layers.bgGrid);
      this.layers.main.batchDraw();
    }

    if (this.clientCapabilities.pen) {
      if (!this.currentLine || !this.drawing) return;
      if (this.disabledListeningShape) {
        this.disabledListeningShape.listening(true);
        this.disabledListeningShape = undefined;
      }
      this.drawing = false;

      if (this.props.toolMode === ToolModes.Draw) {
        DrawService.stopDrawing(this.currentLine, this.stage);
        this.currentForces = [];
        this.layers.main.batchDraw();
      } else if (this.props.toolMode === ToolModes.Select) {
        DrawService.stopSelecting(this.currentLine, this.stage, this.layers);
        this.layers.selecting.batchDraw();
      }
    }
  }

  private onTouchMove(event: Konva.KonvaEventObject<TouchEvent | PointerEvent>): void {
    event.evt.preventDefault(); // Chrome on desktop would maybe otherwise think that we start a gesture
    if (!this.stage) return;
    if (
      !this.drawing &&
      !this.clientCapabilities.pen &&
      (event.evt as TouchEvent).targetTouches &&
      (event.evt as TouchEvent).targetTouches.length === 2
    ) {
      // Pinch to zoom
      const touch1 = (event.evt as TouchEvent).targetTouches[0];
      const touch2 = (event.evt as TouchEvent).targetTouches[1];
      if (touch1 && touch2) {
        event.evt.stopPropagation();
        TransformService.pinchToZoom(this.stage, touch1, touch2);
      }
    }
    if (!this.drawing || !this.currentLine) return;
    if (!this.clientCapabilities.pen) return;

    const pointerPos = PointerService.getStagePointerPosition(this.stage);
    if (this.props.toolMode === ToolModes.Draw) {
      // Draw
      if (
        this.currentForces.length > 0 &&
        pointerPos.x === this.currentForces[this.currentForces.length - 1].pos.x &&
        pointerPos.y === this.currentForces[this.currentForces.length - 1].pos.y
      )
        return;

      if (!this.clientCapabilities.force) {
        this.currentForces.push({ pos: pointerPos, force: 1 });
      } else if ((event.evt as TouchEvent).targetTouches) {
        this.currentForces.push({
          pos: pointerPos,
          force: Math.max((event.evt as TouchEvent).targetTouches[0].force, 0.1),
        });
      } else if ((event.evt as PointerEvent).pressure) {
        this.currentForces.push({ pos: pointerPos, force: Math.max((event.evt as PointerEvent).pressure, 0.1) });
      }
      DrawService.draw(this.currentLine, this.currentForces, this.state.strokeWidth);
    } else if (this.props.toolMode === ToolModes.Select) {
      // Select
      DrawService.select(this.currentLine, this.layers.selecting, pointerPos);
    }
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
      this.layers.selecting = new Konva.Layer({
        hitGraphEnabled: false,
      });
      this.stage.add(this.layers.bgGrid);
      this.stage.add(this.layers.main);
      this.stage.add(this.layers.selecting);

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
      document.addEventListener('stylusplugin-up', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchEnd({ evt: event } as Konva.KonvaEventObject<TouchEvent>);
      });
      this.stage.on('dragend', () => {
        if (!this.stage) return;
        DrawService.drawBGGrid(this.stage, this.layers.bgGrid);
      });

      const circle = new Konva.Circle({
        x: 350,
        y: 250,
        radius: 100,
        fill: 'black',
        name: 'userContent shape',
      });
      const circle2 = new Konva.Circle({
        x: 100,
        y: 250,
        radius: 100,
        fill: 'black',
        name: 'userContent shape',
      });
      this.layers.main.add(circle);
      this.layers.main.add(circle2);
      circle.draw();
      circle2.draw();
      circle.cache({ pixelRatio: window.devicePixelRatio * this.stage.scaleX(), offset: 1 });
    }
  }

  public render(): ReactNode {
    return <div className={styles.Container} ref={this.containerRef} />;
  }
}

export default KonvaCanvas;
