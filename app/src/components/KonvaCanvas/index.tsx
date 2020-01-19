import React, { ReactNode } from 'react';
import Konva from 'konva';
import LayerList from '../../types/LayerList';
import TransformService from '../../services/Transform';
import DrawService from '../../services/Draw';
import ClientCapabilitiesService from '../../services/ClientCapabilities';
import ToolModes from '../../types/ToolModes';
import EventHandler from './eventHandlers/EventHandler';
import PenEventHandler from './eventHandlers/PenEventHandler';
import TouchEventHandler from './eventHandlers/TouchEventHandler';

import styles from './styles.module.css';

interface KonvaCanvasProps {
  width: number;
  height: number;
  toolMode: ToolModes;
}

class KonvaCanvas extends React.PureComponent<KonvaCanvasProps, {}> {
  private containerRef = React.createRef<HTMLDivElement>();
  private stage: Konva.Stage | undefined;
  private layers: LayerList = {};
  private eventHandler: EventHandler | undefined;

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

  private onTouchStart(event: Konva.KonvaEventObject<PointerEvent>): void {
    if (!this.stage) return;
    const clientCapabilities = ClientCapabilitiesService.getClientCapabilities(event.evt);
    if (clientCapabilities.pen && !(this.eventHandler instanceof PenEventHandler)) {
      this.eventHandler = new PenEventHandler();
    } else if (!(this.eventHandler instanceof TouchEventHandler)) {
      this.eventHandler = new TouchEventHandler();
    }

    this.eventHandler.start(this.stage, event, this.props.toolMode);
  }

  private onTouchMove(event: Konva.KonvaEventObject<PointerEvent | TouchEvent>): void {
    event.evt.preventDefault(); // Chrome on desktop would maybe otherwise think that we start a gesture
    if (!this.stage) return;

    if (this.eventHandler) this.eventHandler.draw(this.stage, event, this.props.toolMode);
  }

  private onTouchEnd(event: Konva.KonvaEventObject<PointerEvent>): void {
    event.evt.preventDefault();
    if (!this.stage) return;

    if (this.eventHandler) this.eventHandler.stop(this.stage, event, this.props.toolMode);
    this.eventHandler = undefined;
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
        id: 'layer-bgGrid',
      });
      this.layers.main = new Konva.Layer({ id: 'layer-main' });
      this.layers.selecting = new Konva.Layer({
        hitGraphEnabled: false,
        id: 'layer-selecting',
      });
      this.stage.add(this.layers.bgGrid);
      this.stage.add(this.layers.main);
      this.stage.add(this.layers.selecting);

      this.stage.on('dragend', () => {
        if (!this.stage) return;
        DrawService.drawBGGrid(this.stage, this.layers.bgGrid);
      });
      this.stage.on('pointerdown', this.onTouchStart.bind(this)); // this.stage.on('mousedown touchstart', this.onTouchStart.bind(this));
      this.stage.on('pointerup', this.onTouchEnd.bind(this)); // this.stage.on('mouseup touchend touchcancel', this.onTouchEnd.bind(this));
      this.stage.on('pointermove touchmove', this.onTouchMove.bind(this));
      this.containerRef.current.addEventListener('pointerdown', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
          const intersection = this.stage.getIntersection(this.stage.getPointerPosition()) || this.stage;
          // eslint-disable-next-line no-underscore-dangle
          intersection._fireAndBubble('pointerdown', {
            evt: event,
            pointerId: event.pointerId,
            target: intersection,
          });
        }
      });
      this.containerRef.current.addEventListener('pointerup', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
          const intersection = this.stage.getIntersection(this.stage.getPointerPosition()) || this.stage;
          // eslint-disable-next-line no-underscore-dangle
          intersection._fireAndBubble('pointerup', {
            evt: event,
            pointerId: event.pointerId,
            target: intersection,
          });
        }
      });
      this.containerRef.current.addEventListener('pointermove', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
          // eslint-disable-next-line no-underscore-dangle
          this.stage._fireAndBubble('pointermove', {
            evt: event,
            pointerId: event.pointerId,
          });
        }
      });

      document.addEventListener('stylusplugin-down', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchStart({ evt: event } as Konva.KonvaEventObject<PointerEvent>);
      });
      document.addEventListener('stylusplugin-move', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchMove({ evt: event } as Konva.KonvaEventObject<PointerEvent>);
      });
      document.addEventListener('stylusplugin-up', event => {
        if (this.stage) {
          this.stage.setPointersPositions(event);
        }
        this.onTouchEnd({ evt: event } as Konva.KonvaEventObject<PointerEvent>);
      });
    }
  }

  public render(): ReactNode {
    return <div className={styles.Container} ref={this.containerRef} />;
  }
}

export default KonvaCanvas;
