import Konva from 'konva';
import PointerService from './Pointer';
import LayerList from '../types/LayerList';
import ClientCapabilities from '../types/ClientCapabilities';

export default class DrawService {
  public static startDrawing(
    stage: Konva.Stage,
    layers: LayerList,
    strokeColor: string,
    strokeWidth: number,
  ): Konva.Line {
    stage.draggable(false);
    const pointerPos = PointerService.getStagePointerPosition(stage);

    const line = new Konva.Line({
      stroke: strokeColor,
      strokeWidth,
      points: [pointerPos.x, pointerPos.y],
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.4,
      name: 'userContent',
    });
    layers.main.add(line);
    line.draw();
    return line;
  }

  public static draw(currentLine: Konva.Line, stage: Konva.Stage): void {
    const pointerPos = PointerService.getStagePointerPosition(stage);
    const oldPoints = currentLine.points();
    currentLine.points([...oldPoints, pointerPos.x, pointerPos.y]);
    currentLine.draw();
  }

  public static stopDrawing(currentLine: Konva.Line, stage: Konva.Stage, clientCapabilities: ClientCapabilities): void {
    // Draw additional point where touch ended (for dots especially)
    if (clientCapabilities.pen) {
      const pointerPos = PointerService.getStagePointerPosition(stage);
      currentLine.points([...currentLine.points(), pointerPos.x, pointerPos.y]);
      currentLine.draw();
    }

    stage.draggable(true);
  }
}
