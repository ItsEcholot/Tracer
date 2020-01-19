import Konva from 'konva';
import TouchHandler from './TouchHandler';
import TransformService from '../../services/Transform';

export default class TransformTouchHandler implements TouchHandler {
  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    if (event.target === stage) {
      TransformService.stopTransform(stage);
    } else {
      if (!event.target.hasName('userContent') && event.target.id() !== 'selectionGroup') return;
      if (event.target.getParent().id() === 'selectionGroup') return;

      TransformService.startTransform(event.target, stage);
    }
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent | PointerEvent>): void {
    // do nothing;
  }

  public stop(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    // do nothing
  }
}
