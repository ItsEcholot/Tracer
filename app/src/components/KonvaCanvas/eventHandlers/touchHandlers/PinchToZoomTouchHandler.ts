import Konva from 'konva';
import TouchHandler from './TouchHandler';
import PointerService from '../../../../services/Pointer';
import TransformService from '../../../../services/Transform';
import DrawService from '../../../../services/Draw';

export default class PinchToZoomTouchHandler implements TouchHandler {
  private lastPinchZoomDist = 0;
  private lastPinchZoomPoint: Konva.Vector2d | undefined;
  private static minScale = 0.4;
  private static maxScale = 2;

  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>): void {
    event.evt.stopPropagation();
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent | TouchEvent>): void {
    const touchEvent = event.evt as TouchEvent;
    if (!touchEvent.targetTouches) return;

    const touch1 = touchEvent.targetTouches[0];
    const touch2 = touchEvent.targetTouches[1];
    if (touch1 && touch2) {
      event.evt.stopPropagation();

      const oldScale = stage.scaleX();
      const dist = PointerService.getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY },
      );
      if (!this.lastPinchZoomDist) {
        this.lastPinchZoomDist = dist;
      }
      const delta = dist - this.lastPinchZoomDist;
      const px = (touch1.clientX + touch2.clientX) / 2;
      const py = (touch1.clientY + touch2.clientY) / 2;
      const pointer = this.lastPinchZoomPoint || PointerService.clientPointerRelativeToStage(px, py, stage);
      if (!this.lastPinchZoomPoint) {
        this.lastPinchZoomPoint = pointer;
      }

      const startPos: Konva.Vector2d = {
        x: pointer.x / oldScale - stage.x() / oldScale,
        y: pointer.y / oldScale - stage.y() / oldScale,
      };
      const scaleBy = 1.01 + Math.abs(delta) / 100;
      const newScale = delta < 0 ? oldScale / scaleBy : oldScale * scaleBy;
      if (newScale < PinchToZoomTouchHandler.minScale || newScale > PinchToZoomTouchHandler.maxScale) return;
      const newPosition: Konva.Vector2d = {
        x: (pointer.x / newScale - startPos.x) * newScale,
        y: (pointer.y / newScale - startPos.y) * newScale,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position(TransformService.stageDragBoundFunc(newPosition, stage));
      stage.batchDraw();
      this.lastPinchZoomDist = dist;
    }
  }

  public stop(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>): void {
    this.lastPinchZoomDist = 0;
    this.lastPinchZoomPoint = undefined;
    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer
      .getChildren(node => node.hasName('userContent'))
      .each(node => {
        if (!stage) return;
        node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
      });
    const bgGridLayer: Konva.Layer = stage.findOne('#layer-bgGrid');
    DrawService.drawBGGrid(stage, bgGridLayer);
    mainLayer.batchDraw();
  }
}
