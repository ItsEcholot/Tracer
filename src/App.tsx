import React from 'react';
import Paper from 'paper';
import PaperCanvas from './components/PaperCanvas';

class App extends React.PureComponent<{}, {}> {
  public render(): React.ReactNode {
    return (
      <div className="App">
        <PaperCanvas size={new Paper.Size(800, 800)} />
      </div>
    );
  }
}

export default App;
