import React, { ReactNode } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import KonvaCanvas from './components/KonvaCanvas';
import styles from './App.module.css';

class App extends React.PureComponent<{}, {}> {
  public componentDidMount(): void {
    this.preventMobileHeaderSpazz();
  }

  private preventMobileHeaderSpazz(): void {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
      vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }

  public render(): React.ReactNode {
    return (
      <div className={styles.App}>
        <ReactResizeDetector handleWidth handleHeight>
          {({ width, height }: { width: number; height: number }): ReactNode => (
            <KonvaCanvas width={width} height={height} />
          )}
        </ReactResizeDetector>
      </div>
    );
  }
}

export default App;
