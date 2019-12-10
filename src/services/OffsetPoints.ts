import Konva from 'konva';
import OffsetPoint from '../types/OffsetPoint';

export default class OffsetPointsService {
  public static calcOffsetPoints(
    pointA: Konva.Vector2d,
    pointB: Konva.Vector2d,
    offset: number,
    calcPoint: Konva.Vector2d,
  ): OffsetPoint {
    const dirVecX = pointB.x - pointA.x;
    const dirVecY = pointB.y - pointA.y;
    const norm = Math.sqrt(dirVecX ** 2 + dirVecY ** 2);
    const stretchFactor = offset / norm;
    // const midpointX = (pointA.x + pointB.x) / 2;
    // const midpointY = (pointA.y + pointB.y) / 2;

    return {
      point1: { x: calcPoint.x + stretchFactor * -dirVecY, y: calcPoint.y + stretchFactor * dirVecX },
      point2: { x: calcPoint.x + stretchFactor * dirVecY, y: calcPoint.y + stretchFactor * -dirVecX },
    };
  }

  public static calcOffsetPointsAverage(
    pointA: Konva.Vector2d,
    pointB: Konva.Vector2d,
    pointC: Konva.Vector2d,
    offset: number,
  ): OffsetPoint {
    const offsetPoint1 = OffsetPointsService.calcOffsetPoints(pointA, pointB, offset, pointB);
    const offsetPoint2 = OffsetPointsService.calcOffsetPoints(pointC, pointB, offset, pointB);

    return {
      point1: {
        x: (offsetPoint1.point1.x + offsetPoint2.point2.x) / 2,
        y: (offsetPoint1.point1.y + offsetPoint2.point2.y) / 2,
      },
      point2: {
        x: (offsetPoint1.point2.x + offsetPoint2.point1.x) / 2,
        y: (offsetPoint1.point2.y + offsetPoint2.point1.y) / 2,
      },
    };
  }
}
