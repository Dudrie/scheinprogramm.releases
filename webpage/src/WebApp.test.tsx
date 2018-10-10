import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebApp } from './WebApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<WebApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
