import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

let render = () => {
    ReactDOM.render(
        // <AppContainer>
            <App />,
        // </AppContainer>,
        document.getElementById('app')
    );
};

render();

// if (module.hot) {
//     module.hot.accept(render);
// }