import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

function startApp(): void {
  ReactDOM.render(<App />, document.getElementById('root'));
}

if (!(window as any).cordova) {
  startApp();
} else {
  document.addEventListener('deviceready', startApp, true);
}
