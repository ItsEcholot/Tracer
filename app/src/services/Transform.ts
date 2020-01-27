import Konva from 'konva';

export default class TransformService {
  private static onPointerUp: () => void;
  public static startTransform(target: Konva.Node | Konva.Stage, stage: Konva.Stage): void {
    (stage.find('Transformer') as any).destroy();
    target.draggable(true);
    const transformer = new Konva.Transformer({
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      rotateEnabled: true,
      padding: 10,
      anchorSize: 20,
    });
    if (target instanceof Konva.Group) {
      transformer.enabledAnchors(['middle-right', 'bottom-right', 'bottom-center']);
      const clientRect = target.getClientRect({ skipTransform: true });
      const rotationCentre: Konva.Vector2d = {
        x: clientRect.x + clientRect.width / 2,
        y: clientRect.y + clientRect.height / 2,
      };
      let actionHappened: string | undefined;
      target.on('rotationChange', () => {
        actionHappened = 'rotation';
      });
      target.on('dragstart', () => {
        actionHappened = 'translation';
      });
      target.on('scaleXChange scaleYChange', () => {
        actionHappened = 'scale';
      });
      this.onPointerUp = (): void => {
        if (actionHappened === 'rotation') {
          const rotation = target.rotation();
          target.rotation(0);
          target.x(0);
          target.y(0);
          TransformService.applyTransformRotation(stage, target, rotationCentre, rotation);
          transformer.forceUpdate();
        } else if (actionHappened === 'translation') {
          const changeX = target.x();
          const changeY = target.y();
          target.x(0);
          target.y(0);
          TransformService.applyTransformTranslation(stage, target, changeX, changeY);
          transformer.forceUpdate();
        } else if (actionHappened === 'scale') {
          const scaleX = target.scaleX();
          const scaleY = target.scaleY();
          target.scaleX(1);
          target.scaleY(1);
          target.x(0);
          target.y(0);
          TransformService.applyTransformScale(stage, target, scaleX, scaleY);
          transformer.forceUpdate();
        }
        actionHappened = undefined;
      };
      stage.on('pointerup', this.onPointerUp);
    }

    const parent = target.getParent();
    parent.add(transformer);
    transformer.attachTo(target);
    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer.batchDraw();
  }

  public static stopTransform(stage: Konva.Stage): void {
    if (this.onPointerUp) stage.off('pointerup', this.onPointerUp);
    console.dir(stage.eventListeners);
    const selectionGroup: Konva.Group = stage.findOne('#selectionGroup');
    if (selectionGroup) {
      selectionGroup.off('rotationChange');
      selectionGroup.off('dragstart');
      selectionGroup.off('scaleXChange scaleYChange');

      selectionGroup.findOne('.hitRect').destroy();
      const children = selectionGroup.getChildren().toArray();
      const selectionGroupParent = selectionGroup.getParent();
      children.forEach((node: Konva.Node) => {
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

  private static applyTransformRotation(
    stage: Konva.Stage,
    target: Konva.Group,
    rotationCentre: Konva.Vector2d,
    rotation: number,
  ): void {
    target.children.each(node => {
      if (node instanceof Konva.Line) {
        const points = node.points();
        const newPoints = [];
        for (let i = 0; i < points.length; i += 2) {
          const point: Konva.Vector2d = { x: points[i], y: points[i + 1] };
          const rotatedPoint = TransformService.rotatePoint(point, rotationCentre, rotation);
          newPoints.push(rotatedPoint.x, rotatedPoint.y);
        }
        node.points(newPoints);
        node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
      }
    });

    this.createHitRectInGroup(target);
  }

  private static applyTransformTranslation(
    stage: Konva.Stage,
    target: Konva.Group,
    changeX: number,
    changeY: number,
  ): void {
    target.children.each(node => {
      if (node instanceof Konva.Line) {
        const points = node.points();
        const newPoints = [];
        for (let i = 0; i < points.length; i += 2) {
          const point: Konva.Vector2d = { x: points[i], y: points[i + 1] };
          const translatedPoint: Konva.Vector2d = {
            x: point.x + changeX,
            y: point.y + changeY,
          };
          newPoints.push(translatedPoint.x, translatedPoint.y);
        }
        node.points(newPoints);
        node.clearCache();
        // node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
      }
    });

    this.createHitRectInGroup(target);
  }

  private static applyTransformScale(stage: Konva.Stage, target: Konva.Group, scaleX: number, scaleY: number): void {
    const clientRect = target.getClientRect({ skipTransform: true });
    target.children.each(node => {
      if (node instanceof Konva.Line) {
        const points = node.points();
        const newPoints = [];
        for (let i = 0; i < points.length; i += 2) {
          const point: Konva.Vector2d = { x: points[i], y: points[i + 1] };
          const scaledPoint: Konva.Vector2d = {
            x: (point.x - clientRect.x) * scaleX + clientRect.x,
            y: (point.y - clientRect.y) * scaleY + clientRect.y,
          };
          newPoints.push(scaledPoint.x, scaledPoint.y);
        }
        node.points(newPoints);
        node.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });
      }
    });

    this.createHitRectInGroup(target);
  }

  private static rotatePoint(
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

  public static createHitRectInGroup(group: Konva.Group): void {
    const hitRect = group.findOne('.hitRect');
    if (hitRect) hitRect.destroy();
    const clientRect = group.getClientRect({ skipTransform: true });
    group.add(this.createHitRect(clientRect.x, clientRect.y, clientRect.width, clientRect.height));
  }

  public static createHitRect(x: number, y: number, width: number, height: number): Konva.Rect {
    return new Konva.Rect({
      x,
      y,
      width,
      height,
      name: 'hitRect',
      hitFunc: (context, shape): void => {
        context.beginPath();
        context.rect(0, 0, shape.width(), shape.height());
        context.closePath();
        context.fillStrokeShape(shape);
      },
    });
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
