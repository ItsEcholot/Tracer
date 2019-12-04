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
    }
  }

  public render(): React.ReactNode {
    return <canvas className={styles.Canvas} ref={this.canvasRef} />;
  }
}

export default PaperCanvas;
