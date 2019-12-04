import React from 'react';
import Paper from 'paper';
import styles from './styles.module.css';

interface NoteCanvasProps {
  size: Paper.Size;
}

class PaperCanvas extends React.PureComponent<NoteCanvasProps, {}> {
  private canvasRef: React.RefObject<HTMLCanvasElement>;

  private paper: Paper.PaperScope = new Paper.PaperScope();

  constructor(props: NoteCanvasProps) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
  }

  public componentDidMount(): void {
    this.paper.activate();
    if (this.canvasRef.current) {
      this.paper.setup(this.canvasRef.current);
      this.paper.view.viewSize = this.props.size;
      this.paper.view.autoUpdate = false;

      const context = this.canvasRef.current.getContext('2d');
      if (context) {
        context.beginPath();
        context.arc(100, 75, 30, 0, 2 * Math.PI);
        context.stroke();
      }

      const raster = new this.paper.Raster(this.canvasRef.current.toDataURL());
      raster.position = this.paper.view.center;

      const point = new Paper.Point(10, 10);
      const circle = new this.paper.Path.Circle(point, 10);
      circle.strokeColor = new Paper.Color(0, 0, 0);
      setTimeout(() => this.paper.view.update(), 1000);
    }
  }

  public render(): React.ReactNode {
    return <canvas className={styles.Canvas} ref={this.canvasRef} />;
  }
}

export default PaperCanvas;
