import Konva from 'konva';

export default class PolygonService {
  public static pointInPolygon(point: Konva.Vector2d, polygon: any): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
      const xi = polygon[i];
      const yi = polygon[i + 1];
      const xj = polygon[j];
      const yj = polygon[j + 1];

      // eslint-disable-next-line
      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
      j = i;
    }

    return inside;
  }
}
