import Konva from 'konva';

export default class ResourceGroupService {
  public static getTopLeftResourceGroupId(node: Konva.Node): string {
    const clientRect = node.getClientRect({ skipTransform: true });
    const x = Math.floor(clientRect.x / 1000);
    const y = Math.floor(clientRect.y / 1000);
    return `resourceGroup-${x}x${y}`;
  }

  public static getResourceGroupIds(node: Konva.Node): Set<string> {
    const resourceGroupIds = new Set<string>();
    const clientRect = node.getClientRect({ skipTransform: true });

    const x1 = Math.floor(clientRect.x / 1000);
    const y1 = Math.floor(clientRect.y / 1000);
    const x2 = Math.floor((clientRect.x + clientRect.width) / 1000);
    const y2 = Math.floor((clientRect.y + clientRect.height) / 1000);

    for (let x = x1; x <= x2; x += 1) {
      for (let y = y1; y <= y2; y += 1) {
        resourceGroupIds.add(`resourceGroup-${x}x${y}`);
      }
    }

    return resourceGroupIds;
  }
}
