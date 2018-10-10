import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebApp } from './WebApp';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <WebApp />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
