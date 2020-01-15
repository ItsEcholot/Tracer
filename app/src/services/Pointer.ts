import Konva from 'konva';

export default class PointerService {
  public static getStagePointerPosition(stage: Konva.Stage): Konva.Vector2d {
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) throw new Error('No stage pointer position');
    const stageAbsolutePos = stage.getAbsolutePosition();

    pointerPos.x += -stageAbsolutePos.x;
    pointerPos.y += -stageAbsolutePos.y;
    return pointerPos;
  }

  public static clientPointerRelativeToStage(clientX: number, clientY: number, stage: Konva.Stage): Konva.Vector2d {
    return {
      x: clientX - stage.getContent().offsetLeft,
      y: clientY - stage.getContent().offsetTop,
    };
  }

  public static getDistance(p1: Konva.Vector2d, p2: Konva.Vector2d): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
}
