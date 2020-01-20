import Konva from 'konva';

export default class TransformService {
  public static startTransform(target: Konva.Node | Konva.Stage, stage: Konva.Stage): void {
    (stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
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
      const offsetX = selectionGroup.x();
      const offsetY = selectionGroup.y();
      const scaleX = selectionGroup.scaleX();
      const scaleY = selectionGroup.scaleY();

      selectionGroup.findOne('.hitRect').destroy();
      const children = selectionGroup.getChildren().toArray();
      const selectionGroupParent = selectionGroup.getParent();
      children.forEach((node: Konva.Node) => {
        if (node instanceof Konva.Line) {
          const newPoints = node.points().map((value, index) => {
            if (index % 2 === 0) {
              let x = value * scaleX; // scale x
              x += offsetX; // translate x
              return x;
            }
            let y = value * scaleY; // scale y
            y += offsetY; // translate y
            return y;
          });
          node.points(newPoints);
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
}
