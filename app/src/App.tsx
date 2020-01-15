import React, { ReactNode } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import KonvaCanvas from './components/KonvaCanvas';
import styles from './App.module.css';
import Toolbar from './components/Toolbar';
import ToolModes from './types/ToolModes';

declare global {
  interface Window {
    StylusPlugin: { registerListeners: () => void };
  }
}

interface AppState {
  toolMode: ToolModes;
}

class App extends React.PureComponent<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      toolMode: ToolModes.Write,
    };
  }

  public componentDidMount(): void {
    this.preventMobileHeaderSpazz();
    if (window.StylusPlugin) {
      window.StylusPlugin.registerListeners();
    }
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
        <Toolbar toolMode={this.state.toolMode} />
        <ReactResizeDetector handleWidth handleHeight>
          {({ width, height }: { width: number; height: number }): ReactNode => (
            <KonvaCanvas width={width} height={height} toolMode={this.state.toolMode} />
          )}
        </ReactResizeDetector>
      </div>
    );
  }
}

export default App;
