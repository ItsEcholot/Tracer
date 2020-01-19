import Konva from 'konva';
import EventHandler from './EventHandler';
import ToolModes from '../../../types/ToolModes';
import TouchHandler from './touchHandlers/TouchHandler';
import TransformTouchHandler from './touchHandlers/TransformTouchHandler';
import PinchToZoomTouchHandler from './touchHandlers/PinchToZoomTouchHandler';

export default class TouchEventHandler implements EventHandler {
  private touchHandler: TouchHandler | undefined = new TransformTouchHandler();
  private touchEventList: Set<PointerEvent> = new Set();

  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void {
    this.touchEventList.add(event.evt);
    if (this.touchEventList.size === 2) {
      this.touchHandler = new PinchToZoomTouchHandler();
    } else if (!(this.touchHandler instanceof TransformTouchHandler)) {
      this.touchHandler = new TransformTouchHandler();
    }

    if (this.touchHandler) this.touchHandler.start(stage, event);
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent | TouchEvent>, toolMode: ToolModes): void {
    if (this.touchHandler) this.touchHandler.draw(stage, event);
  }

  public stop(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void {
    if (this.touchHandler) this.touchHandler.stop(stage, event);
    this.touchEventList.clear();
    this.touchHandler = undefined;
  }
}
