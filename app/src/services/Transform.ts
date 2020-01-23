import Konva from 'konva';

export default class TransformService {
  public static startTransform(target: Konva.Node | Konva.Stage, stage: Konva.Stage): void {
    (stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      rotateEnabled: false,
      padding: 10,
      anchorSize: 20,
    });
    const parent = target.getParent();
    parent.add(transformer);
    transformer.attachTo(target);
    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer.batchDraw();
  }

  public static stopTransform(stage: Konva.Stage): void {
    const selectionGroup: Konva.Group = stage.findOne('#selectionGroup');
    if (selectionGroup) {
      // const clientRect = selectionGroup.getClientRect({});
      // const rotation = selectionGroup.rotation();
      const offsetX = selectionGroup.x();
      const offsetY = selectionGroup.y();
      const scaleX = selectionGroup.scaleX();
      const scaleY = selectionGroup.scaleY();

      selectionGroup.findOne('.hitRect').destroy();
      const children = selectionGroup.getChildren().toArray();
      const selectionGroupParent = selectionGroup.getParent();
      children.forEach((node: Konva.Node) => {
        if (node instanceof Konva.Line) {
          const points = node.points();
          const newPoints = [];
          for (let i = 0; i < points.length; i += 2) {
            const point: Konva.Vector2d = { x: points[i], y: points[i + 1] };
            const scaledPoint: Konva.Vector2d = { x: point.x * scaleX, y: point.y * scaleY };
            const translatedPoint: Konva.Vector2d = {
              x: scaledPoint.x + offsetX,
              y: scaledPoint.y + offsetY,
            };
            newPoints.push(translatedPoint.x, translatedPoint.y);
          }
          node.points(newPoints);

          /* const clientRect = selectionGroup.getClientRect({});
          const rotationCentre: Konva.Vector2d = {
            x: clientRect.x + clientRect.width / 2,
            y: clientRect.y + clientRect.height / 2,
          };
          points = node.points();
          newPoints = [];
          for (let i = 0; i < points.length; i += 2) {
            const point: Konva.Vector2d = { x: points[i], y: points[i + 1] };
            const rotatedPoint = TransformService.rotatePoint(point, rotationCentre, rotation);
            newPoints.push(rotatedPoint.x, rotatedPoint.y);
          }
          node.points(newPoints); */

          node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
        }
        selectionGroupParent.add(node);
      });
      selectionGroup.destroy();
    }
    stage.find('Transformer').each((child: Konva.Node) => {
      const transformer = child as Konva.Transformer;
      transformer.getNode().draggable(false);
      transformer.destroy();
    });
    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer.batchDraw();
  }

  public static stageDragBoundFunc(pos: Konva.Vector2d, stage: Konva.Stage): Konva.Vector2d {
    return {
      x: pos.x < 0 ? pos.x : (stage as any).absolutePosition().x,
      y: pos.y < 0 ? pos.y : (stage as any).absolutePosition().y,
    };
  }

  public static changeStageSize(stage: Konva.Stage, width: number, height: number): void {
    stage.width(width);
    stage.height(height);
    stage.batchDraw();
  }

  public static rotatePoint(
    pointToRotate: Konva.Vector2d,
    centerPoint: Konva.Vector2d,
    angleInDegrees: number,
  ): Konva.Vector2d {
    const angleInRadians = angleInDegrees * (Math.PI / 180);
    const cosTheta = Math.cos(angleInRadians);
    const sinTheta = Math.sin(angleInRadians);
    return {
      x: cosTheta * (pointToRotate.x - centerPoint.x) - sinTheta * (pointToRotate.y - centerPoint.y) + centerPoint.x,
      y: sinTheta * (pointToRotate.x - centerPoint.x) + cosTheta * (pointToRotate.y - centerPoint.y) + centerPoint.y,
    };
  }
}
