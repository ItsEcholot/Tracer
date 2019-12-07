import React from 'react';
import PaperCanvas from './components/PaperCanvas';

interface AppState {
  width: number;
  height: number;
  renderWidth: number;
  renderHeight: number;
}

class App extends React.PureComponent<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      width: 800,
      height: 800,
      renderWidth: 800,
      renderHeight: 800,
    };
  }

  public render(): React.ReactNode {
    return (
      <div className="App">
        <PaperCanvas
          width={this.state.width}
          height={this.state.height}
          contentHeight={this.state.renderHeight}
          contentWidth={this.state.renderWidth}
        />
      </div>
    );
  }
}

export default App;
