import Konva from 'konva';
import PenHandler from './PenHandler';
import PointerService from '../../services/Pointer';
import PolygonService from '../../services/Polygon';
import TransformService from '../../services/Transform';

export default class SelectPenHandler implements PenHandler {
  private currentLine: Konva.Line | undefined;

  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    const selectingLayer: Konva.Layer = stage.findOne('#layer-selecting');
    selectingLayer.destroyChildren();
    selectingLayer.batchDraw();

    this.currentLine = new Konva.Line({
      stroke: 'black',
      dash: [10, 5],
      fill: 'rgba(200,200,200,0.3)',
      points: [],
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.4,
      closed: true,
      name: 'userContent selecting',
      listening: false,
      draggable: false,
      hitStrokeWidth: 0,
      perfectDrawEnabled: false,
    });
    this.currentLine.shadowForStrokeEnabled(false);

    selectingLayer.add(this.currentLine);
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent | PointerEvent>): void {
    if (!this.currentLine) return;

    const oldPoints = this.currentLine.points();
    const pointerPos = PointerService.getStagePointerPosition(stage);
    this.currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);

    const selectingLayer: Konva.Layer = stage.findOne('#layer-selecting');
    selectingLayer.batchDraw();
  }

  public stop(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    if (this.currentLine) {
      const linePoints = this.currentLine.points();
      const selectionGroup = new Konva.Group({
        id: 'selectionGroup',
        draggable: true,
      });

      const mainLayer: Konva.Layer = stage.findOne('#layer-main');
      mainLayer
        .getChildren(node => node.hasName('writing'))
        .each(node => {
          if (node instanceof Konva.Line) {
            const nodeLinePoints = node.points();
            let inSelection = false;
            for (let i = 0; i < nodeLinePoints.length; i += 10) {
              inSelection =
                PolygonService.pointInPolygon({ x: nodeLinePoints[i], y: nodeLinePoints[i + 1] }, linePoints) ||
                inSelection;
            }
            inSelection =
              PolygonService.pointInPolygon(
                { x: nodeLinePoints[nodeLinePoints.length - 2], y: nodeLinePoints[nodeLinePoints.length - 1] },
                linePoints,
              ) || inSelection;

            if (inSelection) {
              node.listening(true);
              selectionGroup.add(node);
            }
          }
        });

      if (selectionGroup.hasChildren()) {
        mainLayer.add(selectionGroup);
        TransformService.startTransform(selectionGroup, stage);
      }

      this.currentLine.destroy();
    }
    const selectingLayer: Konva.Layer = stage.findOne('#layer-selecting');
    stage.draggable(true);
    selectingLayer.batchDraw();
  }
}
