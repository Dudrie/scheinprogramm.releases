import { AppBar, createMuiTheme, Divider, Drawer, Grid, List, ListItem, ListItemIcon, ListItemText, ListSubheader, MuiThemeProvider, StyleRulesCallback, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as NotificationSystem from 'react-notification-system';
import { SquareButton } from './components/controls/SquareButton';
// import {} from '@material-ui/core';
import EventNames from './helpers/EventNames';
import Language from './helpers/Language';
import StateService, { AppState } from './helpers/StateService';
import { CreateLecture } from './scenes/CreateLecture';
import { LectureOverview } from './scenes/LectureOverview';
import { NotificationService } from './helpers/NotificationService';
import { blueGrey } from '@material-ui/core/colors'

type AppBarButtonType = 'back' | 'menu';

const APP_BAR_HEIGHT: number = 50;

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#2076d8'
        },
        background: {
            default: '#272727'
        }
    }
});

type AppClassKey = 'content';
type PropType = object & WithStyles<AppClassKey>;
const style: StyleRulesCallback<AppClassKey> = () => ({
    content: {
        backgroundColor: theme.palette.background.default,
        marginTop: APP_BAR_HEIGHT + 'px',
        width: '100vw',
        height: 'calc(100vh - ' + APP_BAR_HEIGHT + 'px)',
        paddingTop: '20px',
        paddingBottom: '8px',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontFamily: 'Roboto, Consolas',
        userSelect: 'none',
        cursor: 'default',
        color: theme.palette.text.primary,
        boxSizing: 'border-box',
        '& *': {
            boxSizing: 'border-box'
        }
    }
});

const notificationStyle: NotificationSystem.Style = {
    NotificationItem: {
        DefaultStyle: {
            // backgroundColor: theme.palette.background.paper,
            backgroundColor: blueGrey['900'],
            color: '#ffffff',
            fontFamily: theme.typography.fontFamily,
            // border: '1px solid ' + theme.palette.primary.main,
            borderTopWidth: '4px',
            borderRadius: 0,
            boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)'
        },
        info: {
            borderTopColor: theme.palette.primary.dark,
        }
    },

    Title: {
        DefaultStyle: {
            fontWeight: 500,
            borderBottom: '1px solid ' + theme.palette.grey["600"]
        },
        info: {
            color: theme.palette.primary.light
        }
    },

    Dismiss: {
        DefaultStyle: {
            backgroundColor: 'transparent'
        }
    }
};

interface State {
    isDrawerOpen: boolean;
    scene: React.ReactNode;
    appBarTitle: string;
    appBarButtonType: AppBarButtonType;
}

class ClassApp extends React.Component<PropType, State> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            scene: <></>,
            isDrawerOpen: false,
            appBarTitle: '',
            appBarButtonType: 'back'
        };

        this.createLecture = this.createLecture.bind(this);
        this.onAppStateChanged = this.onAppStateChanged.bind(this);
        this.toggleDrawer = this.toggleDrawer.bind(this);

        StateService.registerListener(this.onAppStateChanged);

        ipcRenderer.on(EventNames.M_EV_CREATE_LECTURE, this.createLecture);
    }

    componentDidMount() {
        StateService.setState(AppState.OVERVIEW_LECTURE);

        // FIXME: Nur zum Entwickeln - REMOVE ME!
        StateService.setState(AppState.CREATE_LECTURE);
    }

    render() {
        return (
            <MuiThemeProvider theme={theme}>
                {/* AppBar */}
                <AppBar style={{ height: APP_BAR_HEIGHT + 'px' }} >
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
                                {this.state.appBarButtonType === 'menu' &&
                                    // TODO: Funktionalität
                                    <SquareButton
                                        onClick={() => this.toggleDrawer(true)}
                                    // tooltip={
                                    //     <Typography variant='body2' >
                                    //         {Language.getString('TOOLTIP_APP_BAR_MENU')}
                                    //     </Typography>
                                    // }
                                    >
                                        <i className='far fa-bars' ></i>
                                    </SquareButton>
                                }
                                {this.state.appBarButtonType === 'back' &&
                                    <SquareButton
                                        onClick={() => StateService.goBack()}
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
                                    {this.state.appBarTitle}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>

                {/* Drawer */}
                <Drawer anchor='left' open={this.state.isDrawerOpen} onClose={() => this.toggleDrawer(false)} >
                    <div
                        role='button'
                        onClick={() => this.toggleDrawer(false)}
                        onKeyDown={() => this.toggleDrawer(false)}
                    >
                        <List>
                            <ListSubheader>
                                {Language.getString('DRAWER_SUBHEADER_LECTURE')}
                            </ListSubheader>
                            <ListItem button disabled>
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fal fa-book' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_CHOOSE_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_CHOOSE_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <ListItem button onClick={this.createLecture} >
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fas fa-plus' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_CREATE_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_CREATE_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <ListItem button disabled>
                                <ListItemIcon style={{ width: '16px', height: '16px' }} >
                                    <i className='fal fa-pen' ></i>
                                </ListItemIcon>
                                <ListItemText
                                    primary={Language.getString('DRAWER_EDIT_LECTURE_PRIMARY')}
                                    secondary={Language.getString('DRAWER_EDIT_LECTURE_SECONDARY')}
                                />
                            </ListItem>
                            <Divider />
                        </List>
                    </div>
                </Drawer>

                {/* Main Scene. */}
                <div
                    className={this.props.classes.content}
                >
                    {this.state.scene}
                </div>

                <NotificationSystem ref={this.onNotificationSystemRef} style={notificationStyle} />
            </MuiThemeProvider >
        );
    }

    private createLecture() {
        StateService.setState(AppState.CREATE_LECTURE);
    }

    private toggleDrawer(isOpened: boolean) {
        this.setState({
            isDrawerOpen: isOpened
        });
    }

    private onAppStateChanged(_oldState: AppState, newState: AppState) {
        let scene: React.ReactNode = <></>;
        let appBarButtonType: AppBarButtonType = 'back'; // Don't show the menuButton on default.

        switch (newState) {
            case AppState.OVERVIEW_LECTURE:
                scene = <LectureOverview />;
                appBarButtonType = 'menu';
                break;

            case AppState.CREATE_LECTURE:
                scene = <CreateLecture />;
                break;

            default:
                scene = <Typography variant='display2' >STATE NICHT ZUGEORDNET</Typography>;
                console.error('Zum gegebenen neuen State konnte keine Scene gefunden werden. Neuer State: ' + AppState[newState] + '.');
        }

        this.setState({
            // TODO: Tatsächlichen Vorlesungsnamen benutzen.
            appBarTitle: Language.getAppBarTitle(newState, 'DUMMY_VORLESUNGSNAME'),
            scene,
            appBarButtonType
        });
    }

    private onNotificationSystemRef = (system: NotificationSystem.System | null) => {
        if (!system) {
            // TODO: Speziell behandeln?
            return;
        }

        NotificationService.setSystem(system);

        NotificationService.showNotification({
            title: 'Infonotification',
            message: 'Ich bin nur eine Testbenachrichtigung, bitte ignorieren',
            level: 'info',
            autoDismiss: 0
        });
    }
}

export const App = withStyles(style)<object>(ClassApp);