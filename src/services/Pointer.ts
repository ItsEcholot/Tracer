import Konva from 'konva';

export default class PointerService {
  public static getStagePointerPosition(stage: Konva.Stage): Konva.Vector2d {
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) throw new Error('No stage pointer position');
    const stageAbsolutePos = stage.getAbsolutePosition();
    stageAbsolutePos.x *= -1;
    stageAbsolutePos.y *= -1;

    pointerPos.x += stageAbsolutePos.x;
    pointerPos.y += stageAbsolutePos.y;
    return pointerPos;
  }
}
