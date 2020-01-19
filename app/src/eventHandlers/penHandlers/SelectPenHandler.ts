import Konva from 'konva';
import PenHandler from './PenHandler';
import PointerService from '../../services/Pointer';
import PolygonService from '../../services/Polygon';
import TransformService from '../../services/Transform';

export default class SelectPenHandler implements PenHandler {
  private currentLine: Konva.Line | undefined;

  public start(stage: Konva.Stage): void {
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

  public draw(stage: Konva.Stage): void {
    if (!this.currentLine) return;

    const oldPoints = this.currentLine.points();
    const pointerPos = PointerService.getStagePointerPosition(stage);
    this.currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);

    const selectingLayer: Konva.Layer = stage.findOne('#layer-selecting');
    selectingLayer.batchDraw();
  }

  public stop(stage: Konva.Stage): void {
    if (this.currentLine) {
      const linePoints = this.currentLine.points();
      const selectionGroup = new Konva.Group({
        id: 'selectionGroup',
        draggable: true,
      });
      let groupX = Number.MAX_SAFE_INTEGER;
      let groupY = Number.MAX_SAFE_INTEGER;
      let groupWidth = 0;
      let groupHeight = 0;

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
              const nodeSelfRect = node.getSelfRect();
              groupX = Math.min(nodeSelfRect.x, groupX);
              groupY = Math.min(nodeSelfRect.y, groupY);
              groupWidth = Math.max(nodeSelfRect.x + nodeSelfRect.width) - groupX;
              groupHeight = Math.max(nodeSelfRect.y + nodeSelfRect.height) - groupY;

              node.listening(true);
              selectionGroup.add(node);
            }
          }
        });

      if (selectionGroup.hasChildren()) {
        if (selectionGroup.getChildren().length > 1) {
          const hitRect = new Konva.Rect({
            x: groupX,
            y: groupY,
            width: groupWidth,
            height: groupHeight,
            name: 'hitRect',
            hitFunc: (context, shape): void => {
              context.beginPath();
              context.rect(0, 0, shape.width(), shape.height());
              context.closePath();
              context.fillStrokeShape(shape);
            },
          });
          selectionGroup.add(hitRect);
        }
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
