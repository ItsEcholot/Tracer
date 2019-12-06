import React from 'react';
import Paper from 'paper';
import PaperJsOffset from 'paperjs-offset';
import styles from './styles.module.css';

interface NoteCanvasProps {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

interface DistanceForces {
  distance: number;
  force: number;
}

class PaperCanvas extends React.PureComponent<NoteCanvasProps, {}> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private paper = new Paper.PaperScope();
  private currentPath: Paper.Path | undefined;
  private supportsForce = false;
  private currentForces: DistanceForces[] = [];

  public componentDidMount(): void {
    PaperJsOffset(this.paper);
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
    this.paper.activate();
    this.currentPath = new this.paper.Path({
      segments: [event.point],
      strokeColor: '#000000',
      strokeWidth: 3,
      strokeCap: 'round',
    });

    const eventEvent = (event as any).event;
    if (eventEvent.type === 'touchstart') {
      const targetTouch = eventEvent.targetTouches.item(0);
      if (targetTouch && targetTouch.force > 0) {
        this.supportsForce = true;
        this.currentForces = [];
      }
    }
  }

  private onMouseDrag(event: Paper.MouseEvent): void {
    if (this.currentPath && event.point) {
      this.currentPath.add(event.point);
      if (this.supportsForce && event.delta && event.delta.x && event.delta.y) {
        const distance = Math.sqrt(event.delta.x * event.delta.x + event.delta.y * event.delta.y);
        this.currentForces.push({
          distance,
          force: Math.max((event as any).event.targetTouches.item(0).force, 0.2),
        });
      }
    }
  }

  private onMouseUp(event: Paper.MouseEvent): void {
    if (this.currentPath) {
      this.currentPath.simplify(1);

      let path = this.currentPath;
      const paths = [path];
      let newPath;
      if (this.supportsForce) {
        this.currentForces.forEach((distanceForce, index) => {
          if (distanceForce.distance >= 20 && this.currentForces[index - 1]) {
            const forceSteps =
              (distanceForce.force - this.currentForces[index - 1].force) / (distanceForce.distance / 20);
            for (let i = 1; i <= distanceForce.distance / 20; i += 1) {
              newPath = path.splitAt(i * 20);
              path.strokeWidth = (this.currentForces[index - 1].force + forceSteps * i) * 4;
              path = newPath;
              paths.push(path);
            }
          } else {
            newPath = path.splitAt(distanceForce.distance);
            path.strokeWidth = distanceForce.force * 4;
            path = newPath;
            paths.push(path);
          }
        });
        if (path && this.currentForces.length >= 1) {
          path.strokeWidth = this.currentForces[this.currentForces.length - 1].force * 4;
        }

        const group = new this.paper.Group(paths);
      }
    }
  }

  public render(): React.ReactNode {
    return <canvas className={styles.Canvas} ref={this.canvasRef} />;
  }
}

export default PaperCanvas;
