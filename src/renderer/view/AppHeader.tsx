import { AppBar, Grid, Toolbar, Typography } from '@material-ui/core';
import { AppBarProps } from '@material-ui/core/AppBar';
import * as React from 'react';
import { SquareButton } from '../components/controls/SquareButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type AppBarButtonType = 'back' | 'menu';

interface Props extends AppBarProps {
    appBarTitle: string;
    buttonType: AppBarButtonType;
    onMenuClicked: () => void;
    onBackClicked: () => void;
}

export class AppHeader extends React.Component<Props, object> {
    render() {
        let { appBarTitle, buttonType, onMenuClicked, onBackClicked, ...other } = this.props;

        return (
            <AppBar {...other} >
                <Toolbar
                    style={{
                        height: '100%',
                        minHeight: '0',
                        paddingLeft: '16px',
                        paddingRight: '16px'
                    }}
                >
                    <Grid container alignItems='center' spacing={8} style={{ height: '35px' }} >
                        <Grid item>
                            {buttonType === 'menu' &&
                                <SquareButton
                                    onClick={onMenuClicked}
                                >
                                    <FontAwesomeIcon icon={{ prefix: 'far', iconName: 'bars' }} />
                                </SquareButton>
                            }
                            {buttonType === 'back' &&
                                <SquareButton
                                    onClick={onBackClicked}
                                >
                                    <FontAwesomeIcon icon={{ prefix: 'fas', iconName: 'arrow-left' }} />
                                </SquareButton>
                            }
                        </Grid>
                        <Grid item xs>
                            <Typography variant='subheading'>
                                {appBarTitle}
                            </Typography>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}