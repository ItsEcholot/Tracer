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

  public static stopDrawing(currentLine: Konva.Line, stage: Konva.Stage): void {
    currentLine.cache();
    stage.draggable(true);
  }
}
