import Konva from 'konva';
import LayerList from '../types/LayerList';
import PointerService from './Pointer';

export default class TransformService {
  public static startTransform(target: Konva.Node | Konva.Stage, stage: Konva.Stage, layers: LayerList): void {
    if (!target.hasName('userContent') && target.id() !== 'selectionGroup') return;
    if (target.getParent().id() === 'selectionGroup') return;

    (stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      padding: 10,
      anchorSize: 20,
    });
    layers.main.add(transformer);
    transformer.attachTo(target);
    layers.main.batchDraw();
  }

  public static stopTransform(stage: Konva.Stage, layers: LayerList): void {
    const selectionGroup = stage.findOne('#selectionGroup');
    if (selectionGroup) {
      const children = selectionGroup.getChildren().toArray();
      const selectionGroupParent = selectionGroup.getParent();
      children.forEach((node: Konva.Node) => {
        node.listening(false);
        selectionGroupParent.add(node);
      });
      selectionGroup.destroy();
    }
    stage.find('Transformer').each((child: Konva.Node) => {
      const transformer = child as Konva.Transformer;
      transformer.getNode().draggable(false);
      transformer.destroy();
    });
    layers.main.batchDraw();
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

  private static lastPinchZoomDist = 0;
  private static lastPinchZoomPoint: Konva.Vector2d | undefined;
  private static minScale = 0.4;
  private static maxScale = 2;
  public static pinchToZoom(stage: Konva.Stage, touch1: Touch, touch2: Touch): void {
    const oldScale = stage.scaleX();
    const dist = PointerService.getDistance(
      { x: touch1.clientX, y: touch1.clientY },
      { x: touch2.clientX, y: touch2.clientY },
    );
    if (!TransformService.lastPinchZoomDist) {
      TransformService.lastPinchZoomDist = dist;
    }
    const delta = dist - TransformService.lastPinchZoomDist;
    const px = (touch1.clientX + touch2.clientX) / 2;
    const py = (touch1.clientY + touch2.clientY) / 2;
    const pointer = TransformService.lastPinchZoomPoint || PointerService.clientPointerRelativeToStage(px, py, stage);
    if (!TransformService.lastPinchZoomPoint) {
      TransformService.lastPinchZoomPoint = pointer;
    }

    const startPos: Konva.Vector2d = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };
    const scaleBy = 1.01 + Math.abs(delta) / 100;
    const newScale = delta < 0 ? oldScale / scaleBy : oldScale * scaleBy;
    if (newScale < TransformService.minScale || newScale > TransformService.maxScale) return;
    const newPosition: Konva.Vector2d = {
      x: (pointer.x / newScale - startPos.x) * newScale,
      y: (pointer.y / newScale - startPos.y) * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(TransformService.stageDragBoundFunc(newPosition, stage));
    stage.batchDraw();
    TransformService.lastPinchZoomDist = dist;
  }

  public static pinchToZoomEnd(stage: Konva.Stage, layers: LayerList): void {
    TransformService.lastPinchZoomDist = 0;
    TransformService.lastPinchZoomPoint = undefined;
    layers.main
      .getChildren(node => node.hasName('userContent'))
      .each(node => {
        if (!stage) return;
        node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
      });
  }

  public static isPinchToZoomRunning(): boolean {
    return !!TransformService.lastPinchZoomPoint;
  }
}
