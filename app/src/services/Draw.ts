import Konva from 'konva';

export default class DrawService {
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
}
