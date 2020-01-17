import Konva from 'konva';
import LayerList from '../types/LayerList';
import TransformService from './Transform';
import CurrentForce from '../types/CurrentForce';
import OffsetPointsService from './OffsetPoints';
import PolygonService from './Polygon';

export default class DrawService {
  public static startDrawing(stage: Konva.Stage, layers: LayerList, strokeColor: string): Konva.Line {
    stage.draggable(false);
    TransformService.stopTransform(stage, layers);
    const currentLine = new Konva.Line({
      fill: strokeColor,
      points: [],
      lineCap: 'round',
      lineJoin: 'round',
      // tension: 0.4,
      closed: true,
      name: 'userContent writing',
      listening: false,
      draggable: false,
      hitStrokeWidth: 0,
      perfectDrawEnabled: false,
    });
    currentLine.shadowForStrokeEnabled(false);

    return currentLine;
  }

  public static stopDrawing(currentLine: Konva.Line, stage: Konva.Stage): void {
    currentLine.tension(0.4);
    currentLine.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
    stage.draggable(true);
  }

  public static draw(currentLine: Konva.Line, currentForces: CurrentForce[], strokeWidth: number): void {
    if (currentForces.length > 2) {
      const middlePoints = OffsetPointsService.calcOffsetPointsAverage(
        currentForces[currentForces.length - 3].pos,
        currentForces[currentForces.length - 2].pos,
        currentForces[currentForces.length - 1].pos,
        currentForces[currentForces.length - 2].force * strokeWidth * 0.5,
      );
      if (!middlePoints.point1.x) return;

      const oldPoints = currentLine.points();
      oldPoints.splice(
        oldPoints.length / 2,
        0,
        middlePoints.point1.x,
        middlePoints.point1.y,
        middlePoints.point2.x,
        middlePoints.point2.y,
      );
      currentLine.points(oldPoints);
    } else if (currentForces.length === 2) {
      const startPoints = OffsetPointsService.calcOffsetPoints(
        currentForces[1].pos,
        currentForces[0].pos,
        currentForces[0].force * strokeWidth * 0.5,
        currentForces[0].pos,
      );
      currentLine.points([startPoints.point1.x, startPoints.point1.y, startPoints.point2.x, startPoints.point2.y]);
    }
    currentLine.draw();
  }

  public static drawBGGrid(stage: Konva.Stage, layer: Konva.Layer | Konva.FastLayer): void {
    layer.destroyChildren();

    const spacingX = 25;
    const spacingY = 25;
    const startX = Math.max(
      Math.floor((-stage.x() / stage.scaleX() - (stage.width() / stage.scaleX()) * 0.5) / spacingX) * spacingX,
      0,
    );
    const endX =
      Math.floor((-stage.x() / stage.scaleX() + (stage.width() / stage.scaleX()) * 1.5) / spacingX) * spacingX;
    const startY = Math.max(
      Math.floor((-stage.y() / stage.scaleY() - (stage.height() / stage.scaleY()) * 0.5) / spacingY) * spacingY,
      0,
    );
    const endY =
      Math.floor((-stage.y() / stage.scaleY() + (stage.height() / stage.scaleY()) * 1.5) / spacingY) * spacingY;

    for (let y = startY; y < endY; y += spacingY) {
      const line = new Konva.Line({
        points: [startX, y, endX, y],
        stroke: 'lightgrey',
        strokeWidth: 1,
        listening: false,
        hitStrokeWidth: 0,
      });
      line.transformsEnabled('position');
      line.shadowForStrokeEnabled(false);
      layer.add(line);
    }
    for (let x = startX; x < endX; x += spacingX) {
      const line = new Konva.Line({
        points: [x, startY, x, endY],
        stroke: 'lightgrey',
        strokeWidth: 1,
        listening: false,
        hitStrokeWidth: 0,
      });
      line.transformsEnabled('position');
      line.shadowForStrokeEnabled(false);
      layer.add(line);
    }

    layer.batchDraw();
    layer.cache({ pixelRatio: stage.scaleX() });
  }

  public static startSelecting(stage: Konva.Stage, layers: LayerList): Konva.Line {
    stage.draggable(false);
    TransformService.stopTransform(stage, layers);

    layers.selecting.destroyChildren();
    layers.selecting.batchDraw();
    const currentLine = new Konva.Line({
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
    currentLine.shadowForStrokeEnabled(false);

    return currentLine;
  }

  public static stopSelecting(currentLine: Konva.Line, stage: Konva.Stage, layers: LayerList): void {
    const linePoints = currentLine.points();
    const selectionGroup = new Konva.Group({ id: 'selectionGroup' });

    layers.main
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
            selectionGroup.add(node);
          }
        }
      });

    if (selectionGroup.hasChildren()) {
      layers.main.add(selectionGroup);
      TransformService.startTransform(selectionGroup, stage, layers);
    }

    currentLine.destroy();
    layers.selecting.batchDraw();
    stage.draggable(true);
  }

  public static select(currentLine: Konva.Line, layer: Konva.Layer, pointerPos: Konva.Vector2d): void {
    const oldPoints = currentLine.points();
    currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);
    layer.batchDraw();
  }
}
