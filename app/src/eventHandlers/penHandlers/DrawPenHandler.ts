import Konva from 'konva';
import PenHandler from './PenHandler';
import PointerService from '../../services/Pointer';
import ClientCapabilitiesService from '../../services/ClientCapabilities';
import CurrentForce from '../../types/CurrentForce';
import OffsetPointsService from '../../services/OffsetPoints';
import ResourceGroupService from '../../services/ResourceGroup';

export default class DrawPenHandler implements PenHandler {
  private currentForces: CurrentForce[] = [];
  private currentLine: Konva.Line | undefined;
  private strokeColor = '#000000';
  private strokeWidth = 4;

  public start(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent>): void {
    const pointerPos = PointerService.getStagePointerPosition(stage);
    const clientCapabilities = ClientCapabilitiesService.getClientCapabilities(event.evt);
    if (clientCapabilities.force && event.evt instanceof PointerEvent) {
      this.currentForces = [{ pos: pointerPos, force: event.evt.pressure }];
    }

    this.currentLine = new Konva.Line({
      fill: this.strokeColor,
      points: [],
      lineCap: 'round',
      lineJoin: 'round',
      closed: true,
      name: 'userContent writing',
      listening: false,
      draggable: false,
      hitStrokeWidth: 0,
      perfectDrawEnabled: false,
      hitFunc: (context, shape): void => {
        const selfRect = shape.getSelfRect();
        context.beginPath();
        context.rect(selfRect.x, selfRect.y, shape.width(), shape.height());
        context.closePath();
        context.fillStrokeShape(shape);
      },
    });
    this.currentLine.shadowForStrokeEnabled(false);

    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer.add(this.currentLine);
  }

  public draw(stage: Konva.Stage, event: Konva.KonvaEventObject<TouchEvent | MouseEvent | PointerEvent>): void {
    if (!this.currentLine) return;

    const pointerPos = PointerService.getStagePointerPosition(stage);
    const clientCapabilities = ClientCapabilitiesService.getClientCapabilities(event.evt);
    if (
      this.currentForces.length > 0 &&
      pointerPos.x === this.currentForces[this.currentForces.length - 1].pos.x &&
      pointerPos.y === this.currentForces[this.currentForces.length - 1].pos.y
    )
      return;

    if (!clientCapabilities.force) {
      this.currentForces.push({ pos: pointerPos, force: 1 });
    } else if ((event.evt as TouchEvent).targetTouches) {
      this.currentForces.push({
        pos: pointerPos,
        force: Math.max((event.evt as TouchEvent).targetTouches[0].force, 0.1),
      });
    } else if ((event.evt as PointerEvent).pressure) {
      this.currentForces.push({ pos: pointerPos, force: Math.max((event.evt as PointerEvent).pressure, 0.1) });
    }

    if (this.currentForces.length > 2) {
      const middlePoints = OffsetPointsService.calcOffsetPointsAverage(
        this.currentForces[this.currentForces.length - 3].pos,
        this.currentForces[this.currentForces.length - 2].pos,
        this.currentForces[this.currentForces.length - 1].pos,
        this.currentForces[this.currentForces.length - 2].force * this.strokeWidth * 0.5,
      );
      if (!middlePoints.point1.x) return;

      const oldPoints = this.currentLine.points();
      oldPoints.splice(
        oldPoints.length / 2,
        0,
        middlePoints.point1.x,
        middlePoints.point1.y,
        middlePoints.point2.x,
        middlePoints.point2.y,
      );
      this.currentLine.points(oldPoints);
    } else if (this.currentForces.length === 2) {
      const startPoints = OffsetPointsService.calcOffsetPoints(
        this.currentForces[1].pos,
        this.currentForces[0].pos,
        this.currentForces[0].force * this.strokeWidth * 0.5,
        this.currentForces[0].pos,
      );
      this.currentLine.points([startPoints.point1.x, startPoints.point1.y, startPoints.point2.x, startPoints.point2.y]);
    }

    this.currentLine.draw();
  }

  public stop(stage: Konva.Stage): void {
    if (this.currentLine) {
      this.currentLine.tension(0.4);
      this.currentLine.cache({ pixelRatio: window.devicePixelRatio * stage.scaleX(), offset: 1 });

      const parent = this.currentLine.getParent();
      const resourceGroup = new Konva.Group({
        id: ResourceGroupService.getTopLeftResourceGroupId(this.currentLine),
        listening: false,
      });
      resourceGroup.add(this.currentLine);
      parent.add(resourceGroup);
    }
    stage.draggable(true);
    this.currentForces = [];

    const mainLayer: Konva.Layer = stage.findOne('#layer-main');
    mainLayer.batchDraw();
  }
}
