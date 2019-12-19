import Konva from 'konva';

export default interface LayerList {
  [key: string]: Konva.Layer | Konva.FastLayer;
}
