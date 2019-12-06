import React from 'react';
import Paper from 'paper';
import styles from './styles.module.css';

interface NoteCanvasProps {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

class PaperCanvas extends React.PureComponent<NoteCanvasProps, {}> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private paper = new Paper.PaperScope();
  private currentPath: Paper.Path | undefined;

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
    this.currentPath = new this.paper.Path({
      segments: [event.point],
      strokeColor: '#000000',
      strokeWidth: 3,
      strokeCap: 'round',
    });
  }

  private onMouseDrag(event: Paper.MouseEvent): void {
    if (this.currentPath && event.point) {
      this.currentPath.add(event.point);
    }
  }

  private onMouseUp(event: Paper.MouseEvent): void {
    if (this.currentPath) {
      this.currentPath.simplify(0);
    }
  }

  public render(): React.ReactNode {
    return <canvas className={styles.Canvas} ref={this.canvasRef} />;
  }
}

export default PaperCanvas;
