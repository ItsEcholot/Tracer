import Konva from 'konva';

export default interface PenHandler {
  start(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void;
  draw(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent | PointerEvent>): void;
  stop(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void;
}
