import Konva from 'konva';
import LayerList from '../types/LayerList';
import TransformService from './Transform';
import CurrentForce from '../types/CurrentForce';
import OffsetPointsService from './OffsetPoints';

export default class DrawService {
  public static startDrawing(stage: Konva.Stage, layers: LayerList, strokeColor: string): Konva.Line {
    stage.draggable(false);
    TransformService.stopTransform(stage, layers);
    const currentLine = new Konva.Line({
      fill: strokeColor,
      points: [],
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.4,
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
    currentLine.cache();
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
    const startX = Math.max(Math.floor((-stage.x() - stage.width() * 0.5) / spacingX) * spacingX, 0);
    const endX = Math.floor((-stage.x() + stage.width() * 1.5) / spacingX) * spacingX;
    const startY = Math.max(Math.floor((-stage.y() - stage.height() * 0.5) / spacingY) * spacingY, 0);
    const endY = Math.floor((-stage.y() + stage.height() * 1.5) / spacingY) * spacingY;

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
    layer.cache();
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

  public static stopSelecting(currentLine: Konva.Line, stage: Konva.Stage): void {
    stage.draggable(true);
  }

  public static select(currentLine: Konva.Line, layer: Konva.Layer, pointerPos: Konva.Vector2d): void {
    const oldPoints = currentLine.points();
    currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);
    layer.batchDraw();
  }
}
