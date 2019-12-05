import React from 'react';
import styles from './styles.module.css';

class DrawCanvas extends React.PureComponent<{}, {}> {
  public render(): React.ReactNode {
    return (
      <canvas className={styles.Canvas} />
    );
  }
}

export default DrawCanvas;