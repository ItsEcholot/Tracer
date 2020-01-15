import ClientCapabilities from '../types/ClientCapabilities';

export default class ClientCapabilitiesService {
  public static updateClientCapabilities(
    event: MouseEvent | TouchEvent | PointerEvent,
    previousClientCapabilities: ClientCapabilities,
  ): ClientCapabilities {
    const clientCapabilities = { ...previousClientCapabilities };

    if (window.TouchEvent && event instanceof TouchEvent) {
      if (event.targetTouches[0].force) {
        clientCapabilities.force = !!event.targetTouches[0].force;
        clientCapabilities.pen = event.targetTouches[0].rotationAngle !== 0;
      }
    } else if (window.PointerEvent && event instanceof PointerEvent) {
      if (event.pressure) {
        clientCapabilities.force = !!event.pressure;
        clientCapabilities.pen = event.pointerType === 'pen';
      }
    }

    return clientCapabilities;
  }
}
