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

  public componentDidMount(): void {
    this.paper.activate();
    if (this.canvasRef.current) {
      this.paper.setup(this.canvasRef.current);
      this.paper.view.viewSize = new Paper.Size(this.props.width, this.props.height);
    }
  }

  public componentDidUpdate(prevProps: NoteCanvasProps) {
    if (prevProps.contentHeight !== this.props.contentHeight || prevProps.contentWidth !== this.props.contentWidth) {
      console.log(`${this.props.contentWidth / prevProps.contentWidth} - ${this.props.contentHeight / prevProps.contentHeight}`);
      this.paper.view.scale(
        this.props.contentWidth / prevProps.contentWidth,
        this.props.contentHeight / prevProps.contentHeight,
        new Paper.Point(0, 0)
      );
    }
    if (prevProps.height !== this.props.height || prevProps.width !== this.props.width) {
      this.paper.view.viewSize = new Paper.Size(this.props.width, this.props.height);
    }
  }

  public render(): React.ReactNode {
    return <canvas className={styles.Canvas} ref={this.canvasRef} />;
  }
}

export default PaperCanvas;
