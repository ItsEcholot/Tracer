import Konva from 'konva';
import EventHandler from './EventHandler';
import ToolModes from '../types/ToolModes';
import PenHandler from './penHandlers/PenHandler';
import DrawPenHandler from './penHandlers/DrawPenHandler';
import SelectPenHandler from './penHandlers/SelectPenHandler';
import TransformService from '../services/Transform';

export default class PenEventHandler implements EventHandler {
  private penHandler: PenHandler | undefined;
  private disabledListeningShape: Konva.Shape | undefined;

  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void {
    if (event.target && event.target instanceof Konva.Shape && event.target.hasName('shape')) {
      this.disabledListeningShape = event.target;
      this.disabledListeningShape.listening(false);
    }

    stage.draggable(false);
    TransformService.stopTransform(stage);

    switch (toolMode) {
      case ToolModes.Draw:
        if (!(this.penHandler instanceof DrawPenHandler)) this.penHandler = new DrawPenHandler();
        break;
      case ToolModes.Select:
        if (!(this.penHandler instanceof SelectPenHandler)) this.penHandler = new SelectPenHandler();
        break;
      default:
        this.penHandler = undefined;
        break;
    }

    if (this.penHandler) this.penHandler.start(stage, event);
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent | TouchEvent>, toolMode: ToolModes): void {
    if (this.penHandler) this.penHandler.draw(stage, event);
  }

  public stop(stage: Konva.Stage, event: Konva.KonvaEventObject<PointerEvent>, toolMode: ToolModes): void {
    if (this.disabledListeningShape) {
      this.disabledListeningShape.listening(true);
      this.disabledListeningShape = undefined;
    }

    if (this.penHandler) this.penHandler.stop(stage, event);
    this.penHandler = undefined;
  }
}
