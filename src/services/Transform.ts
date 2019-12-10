import Konva from 'konva';
import LayerList from '../types/LayerList';

export default class TransformService {
  public static startTransform(target: Konva.Shape | Konva.Stage, stage: Konva.Stage, layers: LayerList): void {
    if (target === stage) {
      TransformService.stopTransform(stage, layers);
      return;
    }
    if (!target.hasName('userContent')) {
      return;
    }

    (stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      padding: 10,
      anchorSize: 20,
    });
    layers.main.add(transformer);
    transformer.attachTo(target);
    layers.main.draw();
  }

  public static stopTransform(stage: Konva.Stage, layers: LayerList): void {
    stage.find('Transformer').each((child: Konva.Node) => {
      const transformer = child as Konva.Transformer;
      transformer.getNode().draggable(false);
      transformer.destroy();
    });
    layers.main.draw();
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
