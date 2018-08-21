import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

import './fonts/fonts_offline.css';

let render = () => {
    ReactDOM.render(
            <App />,
        document.getElementById('app')
    );
};

render();