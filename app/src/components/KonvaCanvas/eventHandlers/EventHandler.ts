import Konva from 'konva';
import ToolModes from '../../../types/ToolModes';

export default interface EventHandler {
  start(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void;
  draw(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent | TouchEvent>, toolMode: ToolModes): void;
  stop(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void;
}
