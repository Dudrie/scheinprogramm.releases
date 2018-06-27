import { AppBar, Grid, Toolbar, Typography } from '@material-ui/core';
import { AppBarProps } from '@material-ui/core/AppBar';
import * as React from 'react';
import { SquareButton } from '../components/controls/SquareButton';

export type AppBarButtonType = 'back' | 'menu';

interface Props extends AppBarProps {
    appBarHeight: number;
    appBarTitle: string;
    buttonType: AppBarButtonType;
    onMenuClicked: () => void;
    onBackClicked: () => void;
}

export class AppHeader extends React.Component<Props, object> {
    render() {
        let { appBarHeight, appBarTitle, buttonType, onMenuClicked, onBackClicked, style, ...other } = this.props;

        if (!style) {
            style = {};
        }

        Object.assign(style, { height: appBarHeight + 'px' });

        return (
            <AppBar style={style} {...other} >
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
                                // TODO: Funktionalität
                                <SquareButton
                                    onClick={onMenuClicked}
                                // tooltip={
                                //     <Typography variant='body2' >
                                //         {Language.getString('TOOLTIP_APP_BAR_MENU')}
                                //     </Typography>
                                // }
                                >
                                    <i className='far fa-bars' ></i>
                                </SquareButton>
                            }
                            {buttonType === 'back' &&
                                <SquareButton
                                    onClick={onBackClicked}
                                // tooltip={
                                //     <Typography variant='body2' >
                                //         {Language.getString('TOOLTIP_APP_BAR_BACK')}
                                //     </Typography>
                                // }
                                >
                                    <i className='far fa-angle-left' ></i>
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