import React from 'react';
import Paper from 'paper';
import styles from './styles.module.css';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Potrace = require('../../../node_modules/potrace-js/src');

interface NoteCanvasProps {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

interface NoteCanvasState {
  debugData: any;
  strokeColor: string;
  strokeWidth: number;
}

interface DistanceForces {
  distance: number;
  force: number;
}

class PaperCanvas extends React.PureComponent<NoteCanvasProps, NoteCanvasState> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private paper = new Paper.PaperScope();
  private currentPath: Paper.Path | undefined;
  private touchIsStylus = false;
  private supportsForce = false;
  private currentForces: DistanceForces[] = [];

  constructor(props: NoteCanvasProps) {
    super(props);
    this.state = {
      debugData: '-',
      strokeColor: '#000000',
      strokeWidth: 3,
    };
  }

  public componentDidMount(): void {
    this.paper.activate();
    if (this.canvasRef.current) {
      this.paper.setup(this.canvasRef.current);
      this.paper.view.viewSize = new Paper.Size(this.props.width, this.props.height);

      this.paper.view.onMouseDown = this.onMouseDown.bind(this);
      this.paper.view.onMouseDrag = this.onMouseDrag.bind(this);
      this.paper.view.onMouseUp = this.onMouseUp.bind(this);
    }
  }

  public componentDidUpdate(prevProps: NoteCanvasProps): void {
    if (prevProps.contentHeight !== this.props.contentHeight || prevProps.contentWidth !== this.props.contentWidth) {
      this.paper.view.scale(
        this.props.contentWidth / prevProps.contentWidth,
        this.props.contentHeight / prevProps.contentHeight,
        new Paper.Point(0, 0),
      );
    }
    if (prevProps.height !== this.props.height || prevProps.width !== this.props.width) {
      this.paper.view.viewSize = new Paper.Size(this.props.width, this.props.height);
    }
  }

  private onMouseDown(event: Paper.MouseEvent): void {
    const eventEvent = (event as any).event;
    if (event.point) {
      if (eventEvent.type === 'mousedown') {
        this.paper.activate();
        this.drawCreateStartingPath(event.point);
      } else if (eventEvent.type === 'touchstart') {
        const targetTouch = eventEvent.targetTouches.item(0);
        this.touchIsStylus = targetTouch.rotationAngle !== 0;
        if (this.touchIsStylus) {
          this.paper.activate();
          this.drawCreateStartingPath(event.point);
          if (targetTouch && targetTouch.force > 0) {
            this.supportsForce = true;
            this.currentForces = [];
          }
        }
      }
    }
  }

  private onMouseDrag(event: Paper.MouseEvent): void {
    if (this.currentPath && event.point) {
      if (this.supportsForce) {
        if (this.touchIsStylus) {
          this.currentPath.add(event.point);
          if (event.delta && event.delta.x && event.delta.y) {
            const distance = Math.sqrt(event.delta.x * event.delta.x + event.delta.y * event.delta.y);
            this.currentForces.push({
              distance,
              force: Math.max((event as any).event.targetTouches.item(0).force, 0.2),
            });
          }
        }
      } else {
        this.currentPath.add(event.point);
      }
    }
  }

  private onMouseUp(event: Paper.MouseEvent): void {
    if (this.currentPath) {
      this.currentPath.simplify(1);

      if (this.supportsForce && this.touchIsStylus) {
        let path = this.currentPath;
        const paths = [path];
        let newPath;

        this.currentForces.forEach((distanceForce, index) => {
          newPath = path.splitAt(distanceForce.distance);
          path.strokeWidth = distanceForce.force * this.state.strokeWidth;
          path = newPath;
          paths.push(path);
        });
        if (path && this.currentForces.length >= 1) {
          path.strokeWidth = this.currentForces[this.currentForces.length - 1].force * this.state.strokeWidth;
        }

        const group = new this.paper.Group(paths);
        this.drawEndVectorizeInsert(group, 2);
      } else {
        const group = new this.paper.Group(this.currentPath);
        this.drawEndVectorizeInsert(group, 1);
      }
    }
  }

  private drawCreateStartingPath(point: Paper.Point): void {
    this.currentPath = new this.paper.Path({
      segments: [point],
      strokeColor: this.state.strokeColor,
      strokeWidth: this.state.strokeWidth,
      strokeCap: 'round',
    });
  }

  private drawEndVectorizeInsert(group: Paper.Group, scale: number): void {
    const raster = group.rasterize(72 * scale, false);
    if (raster.width && raster.height) {
      const canvas = raster.getSubCanvas(new Paper.Rectangle(0, 0, raster.width, raster.height));
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      const bgCanvasContext = bgCanvas.getContext('2d');
      if (bgCanvasContext) {
        bgCanvasContext.fillStyle = '#ffffff';
        bgCanvasContext.fillRect(0, 0, raster.width, raster.height);
        bgCanvasContext.drawImage(canvas, 0, 0);
        const svg: string = Potrace.getSVG(
          Potrace.traceCanvas(bgCanvas, {
            turnpolicy: 'minority',
            turdsize: 2,
            optcurve: true,
            alphamax: 5,
            opttolerance: 5,
          }),
          1,
        );
        if (this.paper.project) {
          const vectorizedPath = this.paper.project.importSVG(svg);
          vectorizedPath.position = group.position;
          vectorizedPath.scale(1 / scale);
        }

        canvas.remove();
        raster.remove();
        group.remove();
      }
    }
  }

  public render(): React.ReactNode {
    return (
      <>
        <h4>{JSON.stringify(this.state.debugData)}</h4>
        <canvas className={styles.Canvas} ref={this.canvasRef} />
      </>
    );
  }
}

export default PaperCanvas;
