import * as React from 'react';
import { MuiThemeProvider, createMuiTheme, createStyles, WithStyles, withStyles } from '@material-ui/core';
import './WebApp.css';

import logo from './logo.svg';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#287ee0',
        },
    }
});

const style = () => createStyles({
    '@global': {
        'body': {
            margin: 0,
            boxSizing: 'border-box'
        }
    },
    app: {
        textAlign: 'center'
    },
    header: {

    }
});

class WebAppClass extends React.Component<WithStyles<typeof style>, object> {
    public render() {
        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={theme} >
                <div className={classes.app}>
                    <header className={classes.header}>
                        <img src={logo} className="App-logo" alt="logo" />
                        <h1 className="App-title">Welcome to React</h1>
                    </header>
                    <p className="App-intro">
                        To get started, edit <code>src/App.tsx</code> and save to reload.
                    </p>
                </div>
            </MuiThemeProvider>
        );
    }
}

export const WebApp = withStyles(style)(WebAppClass);
